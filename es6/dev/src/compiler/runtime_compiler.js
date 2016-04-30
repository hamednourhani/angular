var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IS_DART, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { createHostComponentMeta, CompileIdentifierMetadata } from './compile_metadata';
import { Injectable } from 'angular2/src/core/di';
import { StyleCompiler } from './style_compiler';
import { ViewCompiler } from './view_compiler/view_compiler';
import { TemplateParser } from './template_parser';
import { DirectiveNormalizer } from './directive_normalizer';
import { CompileMetadataResolver } from './metadata_resolver';
import { ComponentFactory } from 'angular2/src/core/linker/component_factory';
import { CompilerConfig } from './config';
import * as ir from './output/output_ast';
import { jitStatements } from './output/output_jit';
import { interpretStatements } from './output/output_interpreter';
import { InterpretiveAppViewInstanceFactory } from './output/interpretive_view';
import { XHR } from 'angular2/src/compiler/xhr';
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
export let RuntimeCompiler = class RuntimeCompiler {
    constructor(_metadataResolver, _templateNormalizer, _templateParser, _styleCompiler, _viewCompiler, _xhr, _genConfig) {
        this._metadataResolver = _metadataResolver;
        this._templateNormalizer = _templateNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._xhr = _xhr;
        this._genConfig = _genConfig;
        this._styleCache = new Map();
        this._hostCacheKeys = new Map();
        this._compiledTemplateCache = new Map();
        this._compiledTemplateDone = new Map();
    }
    resolveComponent(componentType) {
        var compMeta = this._metadataResolver.getDirectiveMetadata(componentType);
        var hostCacheKey = this._hostCacheKeys.get(componentType);
        if (isBlank(hostCacheKey)) {
            hostCacheKey = new Object();
            this._hostCacheKeys.set(componentType, hostCacheKey);
            assertComponent(compMeta);
            var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
            this._loadAndCompileComponent(hostCacheKey, hostMeta, [compMeta], [], []);
        }
        return this._compiledTemplateDone.get(hostCacheKey)
            .then((compiledTemplate) => new ComponentFactory(compMeta.selector, compiledTemplate.viewFactory, componentType));
    }
    clearCache() {
        this._styleCache.clear();
        this._compiledTemplateCache.clear();
        this._compiledTemplateDone.clear();
        this._hostCacheKeys.clear();
    }
    _loadAndCompileComponent(cacheKey, compMeta, viewDirectives, pipes, compilingComponentsPath) {
        var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
        var done = this._compiledTemplateDone.get(cacheKey);
        if (isBlank(compiledTemplate)) {
            compiledTemplate = new CompiledTemplate();
            this._compiledTemplateCache.set(cacheKey, compiledTemplate);
            done =
                PromiseWrapper.all([this._compileComponentStyles(compMeta)].concat(viewDirectives.map(dirMeta => this._templateNormalizer.normalizeDirective(dirMeta))))
                    .then((stylesAndNormalizedViewDirMetas) => {
                    var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                    var styles = stylesAndNormalizedViewDirMetas[0];
                    var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, normalizedViewDirMetas, pipes, compMeta.type.name);
                    var childPromises = [];
                    compiledTemplate.init(this._compileComponent(compMeta, parsedTemplate, styles, pipes, compilingComponentsPath, childPromises));
                    return PromiseWrapper.all(childPromises).then((_) => { return compiledTemplate; });
                });
            this._compiledTemplateDone.set(cacheKey, done);
        }
        return compiledTemplate;
    }
    _compileComponent(compMeta, parsedTemplate, styles, pipes, compilingComponentsPath, childPromises) {
        var compileResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, new ir.ExternalExpr(new CompileIdentifierMetadata({ runtime: styles })), pipes);
        compileResult.dependencies.forEach((dep) => {
            var childCompilingComponentsPath = ListWrapper.clone(compilingComponentsPath);
            var childCacheKey = dep.comp.type.runtime;
            var childViewDirectives = this._metadataResolver.getViewDirectivesMetadata(dep.comp.type.runtime);
            var childViewPipes = this._metadataResolver.getViewPipesMetadata(dep.comp.type.runtime);
            var childIsRecursive = ListWrapper.contains(childCompilingComponentsPath, childCacheKey);
            childCompilingComponentsPath.push(childCacheKey);
            var childComp = this._loadAndCompileComponent(dep.comp.type.runtime, dep.comp, childViewDirectives, childViewPipes, childCompilingComponentsPath);
            dep.factoryPlaceholder.runtime = childComp.proxyViewFactory;
            dep.factoryPlaceholder.name = `viewFactory_${dep.comp.type.name}`;
            if (!childIsRecursive) {
                // Only wait for a child if it is not a cycle
                childPromises.push(this._compiledTemplateDone.get(childCacheKey));
            }
        });
        var factory;
        if (IS_DART || !this._genConfig.useJit) {
            factory = interpretStatements(compileResult.statements, compileResult.viewFactoryVar, new InterpretiveAppViewInstanceFactory());
        }
        else {
            factory = jitStatements(`${compMeta.type.name}.template.js`, compileResult.statements, compileResult.viewFactoryVar);
        }
        return factory;
    }
    _compileComponentStyles(compMeta) {
        var compileResult = this._styleCompiler.compileComponent(compMeta);
        return this._resolveStylesCompileResult(compMeta.type.name, compileResult);
    }
    _resolveStylesCompileResult(sourceUrl, result) {
        var promises = result.dependencies.map((dep) => this._loadStylesheetDep(dep));
        return PromiseWrapper.all(promises)
            .then((cssTexts) => {
            var nestedCompileResultPromises = [];
            for (var i = 0; i < result.dependencies.length; i++) {
                var dep = result.dependencies[i];
                var cssText = cssTexts[i];
                var nestedCompileResult = this._styleCompiler.compileStylesheet(dep.sourceUrl, cssText, dep.isShimmed);
                nestedCompileResultPromises.push(this._resolveStylesCompileResult(dep.sourceUrl, nestedCompileResult));
            }
            return PromiseWrapper.all(nestedCompileResultPromises);
        })
            .then((nestedStylesArr) => {
            for (var i = 0; i < result.dependencies.length; i++) {
                var dep = result.dependencies[i];
                dep.valuePlaceholder.runtime = nestedStylesArr[i];
                dep.valuePlaceholder.name = `importedStyles${i}`;
            }
            if (IS_DART || !this._genConfig.useJit) {
                return interpretStatements(result.statements, result.stylesVar, new InterpretiveAppViewInstanceFactory());
            }
            else {
                return jitStatements(`${sourceUrl}.css.js`, result.statements, result.stylesVar);
            }
        });
    }
    _loadStylesheetDep(dep) {
        var cacheKey = `${dep.sourceUrl}${dep.isShimmed ? '.shim' : ''}`;
        var cssTextPromise = this._styleCache.get(cacheKey);
        if (isBlank(cssTextPromise)) {
            cssTextPromise = this._xhr.get(dep.sourceUrl);
            this._styleCache.set(cacheKey, cssTextPromise);
        }
        return cssTextPromise;
    }
};
RuntimeCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [CompileMetadataResolver, DirectiveNormalizer, TemplateParser, StyleCompiler, ViewCompiler, XHR, CompilerConfig])
], RuntimeCompiler);
class CompiledTemplate {
    constructor() {
        this.viewFactory = null;
        this.proxyViewFactory = (viewUtils, childInjector, contextEl) => this.viewFactory(viewUtils, childInjector, contextEl);
    }
    init(viewFactory) { this.viewFactory = viewFactory; }
}
function assertComponent(meta) {
    if (!meta.isComponent) {
        throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZzk0UkJKSjIudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQ0wsT0FBTyxFQUdQLE9BQU8sRUFJUixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUNMLFdBQVcsRUFJWixNQUFNLGdDQUFnQztPQUNoQyxFQUFDLGNBQWMsRUFBQyxNQUFNLDJCQUEyQjtPQUNqRCxFQUNMLHVCQUF1QixFQU12Qix5QkFBeUIsRUFDMUIsTUFBTSxvQkFBb0I7T0FnQnBCLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsYUFBYSxFQUErQyxNQUFNLGtCQUFrQjtPQUNyRixFQUFDLFlBQVksRUFBQyxNQUFNLCtCQUErQjtPQUNuRCxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQjtPQUN6QyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sd0JBQXdCO09BQ25ELEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxxQkFBcUI7T0FDcEQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLDRDQUE0QztPQU1wRSxFQUFDLGNBQWMsRUFBQyxNQUFNLFVBQVU7T0FDaEMsS0FBSyxFQUFFLE1BQU0scUJBQXFCO09BQ2xDLEVBQUMsYUFBYSxFQUFDLE1BQU0scUJBQXFCO09BQzFDLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSw2QkFBNkI7T0FDeEQsRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLDRCQUE0QjtPQUV0RSxFQUFDLEdBQUcsRUFBQyxNQUFNLDJCQUEyQjtBQUU3Qzs7OztHQUlHO0FBRUg7SUFNRSxZQUFvQixpQkFBMEMsRUFDMUMsbUJBQXdDLEVBQ3hDLGVBQStCLEVBQVUsY0FBNkIsRUFDdEUsYUFB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Q0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxJQUFJLENBQUMsV0FBcUIsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVELHlCQUF5QixJQUE4QjtJQUNyRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxhQUFhLENBQUMsc0JBQXNCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSVNfREFSVCxcbiAgVHlwZSxcbiAgSnNvbixcbiAgaXNCbGFuayxcbiAgaXNQcmVzZW50LFxuICBzdHJpbmdpZnksXG4gIGV2YWxFeHByZXNzaW9uXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgU2V0V3JhcHBlcixcbiAgTWFwV3JhcHBlcixcbiAgU3RyaW5nTWFwV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YSxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlVHlwZU1ldGFkYXRhLFxuICBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSxcbiAgQ29tcGlsZVBpcGVNZXRhZGF0YSxcbiAgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUsXG4gIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFcbn0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7XG4gIFRlbXBsYXRlQXN0LFxuICBUZW1wbGF0ZUFzdFZpc2l0b3IsXG4gIE5nQ29udGVudEFzdCxcbiAgRW1iZWRkZWRUZW1wbGF0ZUFzdCxcbiAgRWxlbWVudEFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEF0dHJBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgVGV4dEFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICB0ZW1wbGF0ZVZpc2l0QWxsXG59IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtTdHlsZUNvbXBpbGVyLCBTdHlsZXNDb21waWxlRGVwZW5kZW5jeSwgU3R5bGVzQ29tcGlsZVJlc3VsdH0gZnJvbSAnLi9zdHlsZV9jb21waWxlcic7XG5pbXBvcnQge1ZpZXdDb21waWxlcn0gZnJvbSAnLi92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXInO1xuaW1wb3J0IHtUZW1wbGF0ZVBhcnNlcn0gZnJvbSAnLi90ZW1wbGF0ZV9wYXJzZXInO1xuaW1wb3J0IHtEaXJlY3RpdmVOb3JtYWxpemVyfSBmcm9tICcuL2RpcmVjdGl2ZV9ub3JtYWxpemVyJztcbmltcG9ydCB7Q29tcGlsZU1ldGFkYXRhUmVzb2x2ZXJ9IGZyb20gJy4vbWV0YWRhdGFfcmVzb2x2ZXInO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50UmVzb2x2ZXIsXG4gIFJlZmxlY3RvckNvbXBvbmVudFJlc29sdmVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21wb25lbnRfcmVzb2x2ZXInO1xuXG5pbXBvcnQge0NvbXBpbGVyQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7aml0U3RhdGVtZW50c30gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2ppdCc7XG5pbXBvcnQge2ludGVycHJldFN0YXRlbWVudHN9IGZyb20gJy4vb3V0cHV0L291dHB1dF9pbnRlcnByZXRlcic7XG5pbXBvcnQge0ludGVycHJldGl2ZUFwcFZpZXdJbnN0YW5jZUZhY3Rvcnl9IGZyb20gJy4vb3V0cHV0L2ludGVycHJldGl2ZV92aWV3JztcblxuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuXG4vKipcbiAqIEFuIGludGVybmFsIG1vZHVsZSBvZiB0aGUgQW5ndWxhciBjb21waWxlciB0aGF0IGJlZ2lucyB3aXRoIGNvbXBvbmVudCB0eXBlcyxcbiAqIGV4dHJhY3RzIHRlbXBsYXRlcywgYW5kIGV2ZW50dWFsbHkgcHJvZHVjZXMgYSBjb21waWxlZCB2ZXJzaW9uIG9mIHRoZSBjb21wb25lbnRcbiAqIHJlYWR5IGZvciBsaW5raW5nIGludG8gYW4gYXBwbGljYXRpb24uXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSdW50aW1lQ29tcGlsZXIgaW1wbGVtZW50cyBDb21wb25lbnRSZXNvbHZlciB7XG4gIHByaXZhdGUgX3N0eWxlQ2FjaGU6IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nPj4gPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTxzdHJpbmc+PigpO1xuICBwcml2YXRlIF9ob3N0Q2FjaGVLZXlzID0gbmV3IE1hcDxUeXBlLCBhbnk+KCk7XG4gIHByaXZhdGUgX2NvbXBpbGVkVGVtcGxhdGVDYWNoZSA9IG5ldyBNYXA8YW55LCBDb21waWxlZFRlbXBsYXRlPigpO1xuICBwcml2YXRlIF9jb21waWxlZFRlbXBsYXRlRG9uZSA9IG5ldyBNYXA8YW55LCBQcm9taXNlPENvbXBpbGVkVGVtcGxhdGU+PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX21ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF90ZW1wbGF0ZU5vcm1hbGl6ZXI6IERpcmVjdGl2ZU5vcm1hbGl6ZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3RlbXBsYXRlUGFyc2VyOiBUZW1wbGF0ZVBhcnNlciwgcHJpdmF0ZSBfc3R5bGVDb21waWxlcjogU3R5bGVDb21waWxlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmlld0NvbXBpbGVyOiBWaWV3Q29tcGlsZXIsIHByaXZhdGUgX3hocjogWEhSLFxuICAgICAgICAgICAgICBwcml2YXRlIF9nZW5Db25maWc6IENvbXBpbGVyQ29uZmlnKSB7fVxuXG4gIHJlc29sdmVDb21wb25lbnQoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50RmFjdG9yeT4ge1xuICAgIHZhciBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhID1cbiAgICAgICAgdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YShjb21wb25lbnRUeXBlKTtcbiAgICB2YXIgaG9zdENhY2hlS2V5ID0gdGhpcy5faG9zdENhY2hlS2V5cy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzQmxhbmsoaG9zdENhY2hlS2V5KSkge1xuICAgICAgaG9zdENhY2hlS2V5ID0gbmV3IE9iamVjdCgpO1xuICAgICAgdGhpcy5faG9zdENhY2hlS2V5cy5zZXQoY29tcG9uZW50VHlwZSwgaG9zdENhY2hlS2V5KTtcbiAgICAgIGFzc2VydENvbXBvbmVudChjb21wTWV0YSk7XG4gICAgICB2YXIgaG9zdE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSA9XG4gICAgICAgICAgY3JlYXRlSG9zdENvbXBvbmVudE1ldGEoY29tcE1ldGEudHlwZSwgY29tcE1ldGEuc2VsZWN0b3IpO1xuXG4gICAgICB0aGlzLl9sb2FkQW5kQ29tcGlsZUNvbXBvbmVudChob3N0Q2FjaGVLZXksIGhvc3RNZXRhLCBbY29tcE1ldGFdLCBbXSwgW10pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29tcGlsZWRUZW1wbGF0ZURvbmUuZ2V0KGhvc3RDYWNoZUtleSlcbiAgICAgICAgLnRoZW4oKGNvbXBpbGVkVGVtcGxhdGU6IENvbXBpbGVkVGVtcGxhdGUpID0+IG5ldyBDb21wb25lbnRGYWN0b3J5KFxuICAgICAgICAgICAgICAgICAgY29tcE1ldGEuc2VsZWN0b3IsIGNvbXBpbGVkVGVtcGxhdGUudmlld0ZhY3RvcnksIGNvbXBvbmVudFR5cGUpKTtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKSB7XG4gICAgdGhpcy5fc3R5bGVDYWNoZS5jbGVhcigpO1xuICAgIHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVDYWNoZS5jbGVhcigpO1xuICAgIHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVEb25lLmNsZWFyKCk7XG4gICAgdGhpcy5faG9zdENhY2hlS2V5cy5jbGVhcigpO1xuICB9XG5cblxuICBwcml2YXRlIF9sb2FkQW5kQ29tcGlsZUNvbXBvbmVudChjYWNoZUtleTogYW55LCBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3RGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGluZ0NvbXBvbmVudHNQYXRoOiBhbnlbXSk6IENvbXBpbGVkVGVtcGxhdGUge1xuICAgIHZhciBjb21waWxlZFRlbXBsYXRlID0gdGhpcy5fY29tcGlsZWRUZW1wbGF0ZUNhY2hlLmdldChjYWNoZUtleSk7XG4gICAgdmFyIGRvbmUgPSB0aGlzLl9jb21waWxlZFRlbXBsYXRlRG9uZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChpc0JsYW5rKGNvbXBpbGVkVGVtcGxhdGUpKSB7XG4gICAgICBjb21waWxlZFRlbXBsYXRlID0gbmV3IENvbXBpbGVkVGVtcGxhdGUoKTtcbiAgICAgIHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVDYWNoZS5zZXQoY2FjaGVLZXksIGNvbXBpbGVkVGVtcGxhdGUpO1xuICAgICAgZG9uZSA9XG4gICAgICAgICAgUHJvbWlzZVdyYXBwZXIuYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs8YW55PnRoaXMuX2NvbXBpbGVDb21wb25lbnRTdHlsZXMoY29tcE1ldGEpXS5jb25jYXQodmlld0RpcmVjdGl2ZXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJNZXRhID0+IHRoaXMuX3RlbXBsYXRlTm9ybWFsaXplci5ub3JtYWxpemVEaXJlY3RpdmUoZGlyTWV0YSkpKSlcbiAgICAgICAgICAgICAgLnRoZW4oKHN0eWxlc0FuZE5vcm1hbGl6ZWRWaWV3RGlyTWV0YXM6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWRWaWV3RGlyTWV0YXMgPSBzdHlsZXNBbmROb3JtYWxpemVkVmlld0Rpck1ldGFzLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIHZhciBzdHlsZXMgPSBzdHlsZXNBbmROb3JtYWxpemVkVmlld0Rpck1ldGFzWzBdO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZWRUZW1wbGF0ZSA9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlUGFyc2VyLnBhcnNlKGNvbXBNZXRhLCBjb21wTWV0YS50ZW1wbGF0ZS50ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZFZpZXdEaXJNZXRhcywgcGlwZXMsIGNvbXBNZXRhLnR5cGUubmFtZSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRQcm9taXNlcyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUuaW5pdCh0aGlzLl9jb21waWxlQ29tcG9uZW50KGNvbXBNZXRhLCBwYXJzZWRUZW1wbGF0ZSwgc3R5bGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVzLCBjb21waWxpbmdDb21wb25lbnRzUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb21pc2VzKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChjaGlsZFByb21pc2VzKS50aGVuKChfKSA9PiB7IHJldHVybiBjb21waWxlZFRlbXBsYXRlOyB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICB0aGlzLl9jb21waWxlZFRlbXBsYXRlRG9uZS5zZXQoY2FjaGVLZXksIGRvbmUpO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZWRUZW1wbGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVDb21wb25lbnQoY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgcGFyc2VkVGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiBzdHJpbmdbXSwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxpbmdDb21wb25lbnRzUGF0aDogYW55W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9taXNlczogUHJvbWlzZTxhbnk+W10pOiBGdW5jdGlvbiB7XG4gICAgdmFyIGNvbXBpbGVSZXN1bHQgPSB0aGlzLl92aWV3Q29tcGlsZXIuY29tcGlsZUNvbXBvbmVudChcbiAgICAgICAgY29tcE1ldGEsIHBhcnNlZFRlbXBsYXRlLFxuICAgICAgICBuZXcgaXIuRXh0ZXJuYWxFeHByKG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtydW50aW1lOiBzdHlsZXN9KSksIHBpcGVzKTtcbiAgICBjb21waWxlUmVzdWx0LmRlcGVuZGVuY2llcy5mb3JFYWNoKChkZXApID0+IHtcbiAgICAgIHZhciBjaGlsZENvbXBpbGluZ0NvbXBvbmVudHNQYXRoID0gTGlzdFdyYXBwZXIuY2xvbmUoY29tcGlsaW5nQ29tcG9uZW50c1BhdGgpO1xuXG4gICAgICB2YXIgY2hpbGRDYWNoZUtleSA9IGRlcC5jb21wLnR5cGUucnVudGltZTtcbiAgICAgIHZhciBjaGlsZFZpZXdEaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSA9XG4gICAgICAgICAgdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRWaWV3RGlyZWN0aXZlc01ldGFkYXRhKGRlcC5jb21wLnR5cGUucnVudGltZSk7XG4gICAgICB2YXIgY2hpbGRWaWV3UGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSA9XG4gICAgICAgICAgdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRWaWV3UGlwZXNNZXRhZGF0YShkZXAuY29tcC50eXBlLnJ1bnRpbWUpO1xuICAgICAgdmFyIGNoaWxkSXNSZWN1cnNpdmUgPSBMaXN0V3JhcHBlci5jb250YWlucyhjaGlsZENvbXBpbGluZ0NvbXBvbmVudHNQYXRoLCBjaGlsZENhY2hlS2V5KTtcbiAgICAgIGNoaWxkQ29tcGlsaW5nQ29tcG9uZW50c1BhdGgucHVzaChjaGlsZENhY2hlS2V5KTtcblxuICAgICAgdmFyIGNoaWxkQ29tcCA9XG4gICAgICAgICAgdGhpcy5fbG9hZEFuZENvbXBpbGVDb21wb25lbnQoZGVwLmNvbXAudHlwZS5ydW50aW1lLCBkZXAuY29tcCwgY2hpbGRWaWV3RGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdQaXBlcywgY2hpbGRDb21waWxpbmdDb21wb25lbnRzUGF0aCk7XG4gICAgICBkZXAuZmFjdG9yeVBsYWNlaG9sZGVyLnJ1bnRpbWUgPSBjaGlsZENvbXAucHJveHlWaWV3RmFjdG9yeTtcbiAgICAgIGRlcC5mYWN0b3J5UGxhY2Vob2xkZXIubmFtZSA9IGB2aWV3RmFjdG9yeV8ke2RlcC5jb21wLnR5cGUubmFtZX1gO1xuICAgICAgaWYgKCFjaGlsZElzUmVjdXJzaXZlKSB7XG4gICAgICAgIC8vIE9ubHkgd2FpdCBmb3IgYSBjaGlsZCBpZiBpdCBpcyBub3QgYSBjeWNsZVxuICAgICAgICBjaGlsZFByb21pc2VzLnB1c2godGhpcy5fY29tcGlsZWRUZW1wbGF0ZURvbmUuZ2V0KGNoaWxkQ2FjaGVLZXkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgZmFjdG9yeTtcbiAgICBpZiAoSVNfREFSVCB8fCAhdGhpcy5fZ2VuQ29uZmlnLnVzZUppdCkge1xuICAgICAgZmFjdG9yeSA9IGludGVycHJldFN0YXRlbWVudHMoY29tcGlsZVJlc3VsdC5zdGF0ZW1lbnRzLCBjb21waWxlUmVzdWx0LnZpZXdGYWN0b3J5VmFyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEludGVycHJldGl2ZUFwcFZpZXdJbnN0YW5jZUZhY3RvcnkoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZhY3RvcnkgPSBqaXRTdGF0ZW1lbnRzKGAke2NvbXBNZXRhLnR5cGUubmFtZX0udGVtcGxhdGUuanNgLCBjb21waWxlUmVzdWx0LnN0YXRlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlUmVzdWx0LnZpZXdGYWN0b3J5VmFyKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhY3Rvcnk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlQ29tcG9uZW50U3R5bGVzKGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgdmFyIGNvbXBpbGVSZXN1bHQgPSB0aGlzLl9zdHlsZUNvbXBpbGVyLmNvbXBpbGVDb21wb25lbnQoY29tcE1ldGEpO1xuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlU3R5bGVzQ29tcGlsZVJlc3VsdChjb21wTWV0YS50eXBlLm5hbWUsIGNvbXBpbGVSZXN1bHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzb2x2ZVN0eWxlc0NvbXBpbGVSZXN1bHQoc291cmNlVXJsOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogU3R5bGVzQ29tcGlsZVJlc3VsdCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICB2YXIgcHJvbWlzZXMgPSByZXN1bHQuZGVwZW5kZW5jaWVzLm1hcCgoZGVwKSA9PiB0aGlzLl9sb2FkU3R5bGVzaGVldERlcChkZXApKTtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHByb21pc2VzKVxuICAgICAgICAudGhlbigoY3NzVGV4dHMpID0+IHtcbiAgICAgICAgICB2YXIgbmVzdGVkQ29tcGlsZVJlc3VsdFByb21pc2VzID0gW107XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHQuZGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVwID0gcmVzdWx0LmRlcGVuZGVuY2llc1tpXTtcbiAgICAgICAgICAgIHZhciBjc3NUZXh0ID0gY3NzVGV4dHNbaV07XG4gICAgICAgICAgICB2YXIgbmVzdGVkQ29tcGlsZVJlc3VsdCA9XG4gICAgICAgICAgICAgICAgdGhpcy5fc3R5bGVDb21waWxlci5jb21waWxlU3R5bGVzaGVldChkZXAuc291cmNlVXJsLCBjc3NUZXh0LCBkZXAuaXNTaGltbWVkKTtcbiAgICAgICAgICAgIG5lc3RlZENvbXBpbGVSZXN1bHRQcm9taXNlcy5wdXNoKFxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVTdHlsZXNDb21waWxlUmVzdWx0KGRlcC5zb3VyY2VVcmwsIG5lc3RlZENvbXBpbGVSZXN1bHQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChuZXN0ZWRDb21waWxlUmVzdWx0UHJvbWlzZXMpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigobmVzdGVkU3R5bGVzQXJyKSA9PiB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHQuZGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVwID0gcmVzdWx0LmRlcGVuZGVuY2llc1tpXTtcbiAgICAgICAgICAgIGRlcC52YWx1ZVBsYWNlaG9sZGVyLnJ1bnRpbWUgPSBuZXN0ZWRTdHlsZXNBcnJbaV07XG4gICAgICAgICAgICBkZXAudmFsdWVQbGFjZWhvbGRlci5uYW1lID0gYGltcG9ydGVkU3R5bGVzJHtpfWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChJU19EQVJUIHx8ICF0aGlzLl9nZW5Db25maWcudXNlSml0KSB7XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0U3RhdGVtZW50cyhyZXN1bHQuc3RhdGVtZW50cywgcmVzdWx0LnN0eWxlc1ZhcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnRlcnByZXRpdmVBcHBWaWV3SW5zdGFuY2VGYWN0b3J5KCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaml0U3RhdGVtZW50cyhgJHtzb3VyY2VVcmx9LmNzcy5qc2AsIHJlc3VsdC5zdGF0ZW1lbnRzLCByZXN1bHQuc3R5bGVzVmFyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbG9hZFN0eWxlc2hlZXREZXAoZGVwOiBTdHlsZXNDb21waWxlRGVwZW5kZW5jeSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdmFyIGNhY2hlS2V5ID0gYCR7ZGVwLnNvdXJjZVVybH0ke2RlcC5pc1NoaW1tZWQgPyAnLnNoaW0nIDogJyd9YDtcbiAgICB2YXIgY3NzVGV4dFByb21pc2UgPSB0aGlzLl9zdHlsZUNhY2hlLmdldChjYWNoZUtleSk7XG4gICAgaWYgKGlzQmxhbmsoY3NzVGV4dFByb21pc2UpKSB7XG4gICAgICBjc3NUZXh0UHJvbWlzZSA9IHRoaXMuX3hoci5nZXQoZGVwLnNvdXJjZVVybCk7XG4gICAgICB0aGlzLl9zdHlsZUNhY2hlLnNldChjYWNoZUtleSwgY3NzVGV4dFByb21pc2UpO1xuICAgIH1cbiAgICByZXR1cm4gY3NzVGV4dFByb21pc2U7XG4gIH1cbn1cblxuY2xhc3MgQ29tcGlsZWRUZW1wbGF0ZSB7XG4gIHZpZXdGYWN0b3J5OiBGdW5jdGlvbiA9IG51bGw7XG4gIHByb3h5Vmlld0ZhY3Rvcnk6IEZ1bmN0aW9uO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb3h5Vmlld0ZhY3RvcnkgPSAodmlld1V0aWxzLCBjaGlsZEluamVjdG9yLCBjb250ZXh0RWwpID0+XG4gICAgICAgIHRoaXMudmlld0ZhY3Rvcnkodmlld1V0aWxzLCBjaGlsZEluamVjdG9yLCBjb250ZXh0RWwpO1xuICB9XG5cbiAgaW5pdCh2aWV3RmFjdG9yeTogRnVuY3Rpb24pIHsgdGhpcy52aWV3RmFjdG9yeSA9IHZpZXdGYWN0b3J5OyB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydENvbXBvbmVudChtZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpIHtcbiAgaWYgKCFtZXRhLmlzQ29tcG9uZW50KSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvdWxkIG5vdCBjb21waWxlICcke21ldGEudHlwZS5uYW1lfScgYmVjYXVzZSBpdCBpcyBub3QgYSBjb21wb25lbnQuYCk7XG4gIH1cbn1cbiJdfQ==