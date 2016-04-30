'use strict';"use strict";
var compile_metadata_1 = require('./compile_metadata');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var o = require('./output/output_ast');
var component_factory_1 = require('angular2/src/core/linker/component_factory');
var util_1 = require('./util');
var _COMPONENT_FACTORY_IDENTIFIER = new compile_metadata_1.CompileIdentifierMetadata({
    name: 'ComponentFactory',
    runtime: component_factory_1.ComponentFactory,
    moduleUrl: "asset:angular2/lib/src/core/linker/component_factory" + util_1.MODULE_SUFFIX
});
var SourceModule = (function () {
    function SourceModule(moduleUrl, source) {
        this.moduleUrl = moduleUrl;
        this.source = source;
    }
    return SourceModule;
}());
exports.SourceModule = SourceModule;
var NormalizedComponentWithViewDirectives = (function () {
    function NormalizedComponentWithViewDirectives(component, directives, pipes) {
        this.component = component;
        this.directives = directives;
        this.pipes = pipes;
    }
    return NormalizedComponentWithViewDirectives;
}());
exports.NormalizedComponentWithViewDirectives = NormalizedComponentWithViewDirectives;
var OfflineCompiler = (function () {
    function OfflineCompiler(_directiveNormalizer, _templateParser, _styleCompiler, _viewCompiler, _outputEmitter) {
        this._directiveNormalizer = _directiveNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._outputEmitter = _outputEmitter;
    }
    OfflineCompiler.prototype.normalizeDirectiveMetadata = function (directive) {
        return this._directiveNormalizer.normalizeDirective(directive);
    };
    OfflineCompiler.prototype.compileTemplates = function (components) {
        var _this = this;
        if (components.length === 0) {
            throw new exceptions_1.BaseException('No components given');
        }
        var statements = [];
        var exportedVars = [];
        var moduleUrl = _templateModuleUrl(components[0].component);
        components.forEach(function (componentWithDirs) {
            var compMeta = componentWithDirs.component;
            _assertComponent(compMeta);
            var compViewFactoryVar = _this._compileComponent(compMeta, componentWithDirs.directives, componentWithDirs.pipes, statements);
            exportedVars.push(compViewFactoryVar);
            var hostMeta = compile_metadata_1.createHostComponentMeta(compMeta.type, compMeta.selector);
            var hostViewFactoryVar = _this._compileComponent(hostMeta, [compMeta], [], statements);
            var compFactoryVar = compMeta.type.name + "NgFactory";
            statements.push(o.variable(compFactoryVar)
                .set(o.importExpr(_COMPONENT_FACTORY_IDENTIFIER)
                .instantiate([
                o.literal(compMeta.selector),
                o.variable(hostViewFactoryVar),
                o.importExpr(compMeta.type)
            ], o.importType(_COMPONENT_FACTORY_IDENTIFIER, null, [o.TypeModifier.Const])))
                .toDeclStmt(null, [o.StmtModifier.Final]));
            exportedVars.push(compFactoryVar);
        });
        return this._codegenSourceModule(moduleUrl, statements, exportedVars);
    };
    OfflineCompiler.prototype.compileStylesheet = function (stylesheetUrl, cssText) {
        var plainStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, false);
        var shimStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, true);
        return [
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, false), _resolveStyleStatements(plainStyles), [plainStyles.stylesVar]),
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, true), _resolveStyleStatements(shimStyles), [shimStyles.stylesVar])
        ];
    };
    OfflineCompiler.prototype._compileComponent = function (compMeta, directives, pipes, targetStatements) {
        var styleResult = this._styleCompiler.compileComponent(compMeta);
        var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, directives, pipes, compMeta.type.name);
        var viewResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, o.variable(styleResult.stylesVar), pipes);
        collection_1.ListWrapper.addAll(targetStatements, _resolveStyleStatements(styleResult));
        collection_1.ListWrapper.addAll(targetStatements, _resolveViewStatements(viewResult));
        return viewResult.viewFactoryVar;
    };
    OfflineCompiler.prototype._codegenSourceModule = function (moduleUrl, statements, exportedVars) {
        return new SourceModule(moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
    };
    return OfflineCompiler;
}());
exports.OfflineCompiler = OfflineCompiler;
function _resolveViewStatements(compileResult) {
    compileResult.dependencies.forEach(function (dep) { dep.factoryPlaceholder.moduleUrl = _templateModuleUrl(dep.comp); });
    return compileResult.statements;
}
function _resolveStyleStatements(compileResult) {
    compileResult.dependencies.forEach(function (dep) {
        dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.sourceUrl, dep.isShimmed);
    });
    return compileResult.statements;
}
function _templateModuleUrl(comp) {
    var moduleUrl = comp.type.moduleUrl;
    var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - util_1.MODULE_SUFFIX.length);
    return urlWithoutSuffix + ".ngfactory" + util_1.MODULE_SUFFIX;
}
function _stylesModuleUrl(stylesheetUrl, shim) {
    return shim ? stylesheetUrl + ".shim" + util_1.MODULE_SUFFIX : "" + stylesheetUrl + util_1.MODULE_SUFFIX;
}
function _assertComponent(meta) {
    if (!meta.isComponent) {
        throw new exceptions_1.BaseException("Could not compile '" + meta.type.name + "' because it is not a component.");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmbGluZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVk1aTEFMSUcudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vZmZsaW5lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxpQ0FLTyxvQkFBb0IsQ0FBQyxDQUFBO0FBRTVCLDJCQUEyQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzVFLDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBTTNELElBQVksQ0FBQyxXQUFNLHFCQUFxQixDQUFDLENBQUE7QUFDekMsa0NBQStCLDRDQUE0QyxDQUFDLENBQUE7QUFFNUUscUJBRU8sUUFBUSxDQUFDLENBQUE7QUFFaEIsSUFBSSw2QkFBNkIsR0FBRyxJQUFJLDRDQUF5QixDQUFDO0lBQ2hFLElBQUksRUFBRSxrQkFBa0I7SUFDeEIsT0FBTyxFQUFFLG9DQUFnQjtJQUN6QixTQUFTLEVBQUUseURBQXVELG9CQUFlO0NBQ2xGLENBQUMsQ0FBQztBQUVIO0lBQ0Usc0JBQW1CLFNBQWlCLEVBQVMsTUFBYztRQUF4QyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUFHLENBQUM7SUFDakUsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUZZLG9CQUFZLGVBRXhCLENBQUE7QUFFRDtJQUNFLCtDQUFtQixTQUFtQyxFQUNuQyxVQUFzQyxFQUFTLEtBQTRCO1FBRDNFLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQ25DLGVBQVUsR0FBVixVQUFVLENBQTRCO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBdUI7SUFBRyxDQUFDO0lBQ3BHLDRDQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFIWSw2Q0FBcUMsd0NBR2pELENBQUE7QUFFRDtJQUNFLHlCQUFvQixvQkFBeUMsRUFDekMsZUFBK0IsRUFBVSxjQUE2QixFQUN0RSxhQUEyQixF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QUFnQixrQkFBYSxvQkFBZSxDQUFDO0FBQ3pELENBQUM7QUFFRCwwQkFBMEIsYUFBcUIsRUFBRSxJQUFhO0lBQzVELE1BQU0sQ0FBQyxJQUFJLEdBQU0sYUFBYSxhQUFRLG9CQUFlLEdBQUcsS0FBRyxhQUFhLEdBQUcsb0JBQWUsQ0FBQztBQUM3RixDQUFDO0FBRUQsMEJBQTBCLElBQThCO0lBQ3RELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxJQUFJLDBCQUFhLENBQUMsd0JBQXNCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxxQ0FBa0MsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlUGlwZU1ldGFkYXRhLFxuICBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YVxufSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuXG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIHVuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtTdHlsZUNvbXBpbGVyLCBTdHlsZXNDb21waWxlRGVwZW5kZW5jeSwgU3R5bGVzQ29tcGlsZVJlc3VsdH0gZnJvbSAnLi9zdHlsZV9jb21waWxlcic7XG5pbXBvcnQge1ZpZXdDb21waWxlciwgVmlld0NvbXBpbGVSZXN1bHR9IGZyb20gJy4vdmlld19jb21waWxlci92aWV3X2NvbXBpbGVyJztcbmltcG9ydCB7VGVtcGxhdGVQYXJzZXJ9IGZyb20gJy4vdGVtcGxhdGVfcGFyc2VyJztcbmltcG9ydCB7RGlyZWN0aXZlTm9ybWFsaXplcn0gZnJvbSAnLi9kaXJlY3RpdmVfbm9ybWFsaXplcic7XG5pbXBvcnQge091dHB1dEVtaXR0ZXJ9IGZyb20gJy4vb3V0cHV0L2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcblxuaW1wb3J0IHtcbiAgTU9EVUxFX1NVRkZJWCxcbn0gZnJvbSAnLi91dGlsJztcblxudmFyIF9DT01QT05FTlRfRkFDVE9SWV9JREVOVElGSUVSID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICBuYW1lOiAnQ29tcG9uZW50RmFjdG9yeScsXG4gIHJ1bnRpbWU6IENvbXBvbmVudEZhY3RvcnksXG4gIG1vZHVsZVVybDogYGFzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3Rvcnkke01PRFVMRV9TVUZGSVh9YFxufSk7XG5cbmV4cG9ydCBjbGFzcyBTb3VyY2VNb2R1bGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kdWxlVXJsOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2U6IHN0cmluZykge31cbn1cblxuZXhwb3J0IGNsYXNzIE5vcm1hbGl6ZWRDb21wb25lbnRXaXRoVmlld0RpcmVjdGl2ZXMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcHVibGljIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBPZmZsaW5lQ29tcGlsZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kaXJlY3RpdmVOb3JtYWxpemVyOiBEaXJlY3RpdmVOb3JtYWxpemVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF90ZW1wbGF0ZVBhcnNlcjogVGVtcGxhdGVQYXJzZXIsIHByaXZhdGUgX3N0eWxlQ29tcGlsZXI6IFN0eWxlQ29tcGlsZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3ZpZXdDb21waWxlcjogVmlld0NvbXBpbGVyLCBwcml2YXRlIF9vdXRwdXRFbWl0dGVyOiBPdXRwdXRFbWl0dGVyKSB7fVxuXG4gIG5vcm1hbGl6ZURpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTpcbiAgICAgIFByb21pc2U8Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcmVjdGl2ZU5vcm1hbGl6ZXIubm9ybWFsaXplRGlyZWN0aXZlKGRpcmVjdGl2ZSk7XG4gIH1cblxuICBjb21waWxlVGVtcGxhdGVzKGNvbXBvbmVudHM6IE5vcm1hbGl6ZWRDb21wb25lbnRXaXRoVmlld0RpcmVjdGl2ZXNbXSk6IFNvdXJjZU1vZHVsZSB7XG4gICAgaWYgKGNvbXBvbmVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignTm8gY29tcG9uZW50cyBnaXZlbicpO1xuICAgIH1cbiAgICB2YXIgc3RhdGVtZW50cyA9IFtdO1xuICAgIHZhciBleHBvcnRlZFZhcnMgPSBbXTtcbiAgICB2YXIgbW9kdWxlVXJsID0gX3RlbXBsYXRlTW9kdWxlVXJsKGNvbXBvbmVudHNbMF0uY29tcG9uZW50KTtcbiAgICBjb21wb25lbnRzLmZvckVhY2goY29tcG9uZW50V2l0aERpcnMgPT4ge1xuICAgICAgdmFyIGNvbXBNZXRhID0gPENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT5jb21wb25lbnRXaXRoRGlycy5jb21wb25lbnQ7XG4gICAgICBfYXNzZXJ0Q29tcG9uZW50KGNvbXBNZXRhKTtcbiAgICAgIHZhciBjb21wVmlld0ZhY3RvcnlWYXIgPSB0aGlzLl9jb21waWxlQ29tcG9uZW50KGNvbXBNZXRhLCBjb21wb25lbnRXaXRoRGlycy5kaXJlY3RpdmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50V2l0aERpcnMucGlwZXMsIHN0YXRlbWVudHMpO1xuICAgICAgZXhwb3J0ZWRWYXJzLnB1c2goY29tcFZpZXdGYWN0b3J5VmFyKTtcblxuICAgICAgdmFyIGhvc3RNZXRhID0gY3JlYXRlSG9zdENvbXBvbmVudE1ldGEoY29tcE1ldGEudHlwZSwgY29tcE1ldGEuc2VsZWN0b3IpO1xuICAgICAgdmFyIGhvc3RWaWV3RmFjdG9yeVZhciA9IHRoaXMuX2NvbXBpbGVDb21wb25lbnQoaG9zdE1ldGEsIFtjb21wTWV0YV0sIFtdLCBzdGF0ZW1lbnRzKTtcbiAgICAgIHZhciBjb21wRmFjdG9yeVZhciA9IGAke2NvbXBNZXRhLnR5cGUubmFtZX1OZ0ZhY3RvcnlgO1xuICAgICAgc3RhdGVtZW50cy5wdXNoKG8udmFyaWFibGUoY29tcEZhY3RvcnlWYXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoby5pbXBvcnRFeHByKF9DT01QT05FTlRfRkFDVE9SWV9JREVOVElGSUVSKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChjb21wTWV0YS5zZWxlY3RvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8udmFyaWFibGUoaG9zdFZpZXdGYWN0b3J5VmFyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRFeHByKGNvbXBNZXRhLnR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKF9DT01QT05FTlRfRkFDVE9SWV9JREVOVElGSUVSLCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICAgICAgZXhwb3J0ZWRWYXJzLnB1c2goY29tcEZhY3RvcnlWYXIpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9jb2RlZ2VuU291cmNlTW9kdWxlKG1vZHVsZVVybCwgc3RhdGVtZW50cywgZXhwb3J0ZWRWYXJzKTtcbiAgfVxuXG4gIGNvbXBpbGVTdHlsZXNoZWV0KHN0eWxlc2hlZXRVcmw6IHN0cmluZywgY3NzVGV4dDogc3RyaW5nKTogU291cmNlTW9kdWxlW10ge1xuICAgIHZhciBwbGFpblN0eWxlcyA9IHRoaXMuX3N0eWxlQ29tcGlsZXIuY29tcGlsZVN0eWxlc2hlZXQoc3R5bGVzaGVldFVybCwgY3NzVGV4dCwgZmFsc2UpO1xuICAgIHZhciBzaGltU3R5bGVzID0gdGhpcy5fc3R5bGVDb21waWxlci5jb21waWxlU3R5bGVzaGVldChzdHlsZXNoZWV0VXJsLCBjc3NUZXh0LCB0cnVlKTtcbiAgICByZXR1cm4gW1xuICAgICAgdGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZShfc3R5bGVzTW9kdWxlVXJsKHN0eWxlc2hlZXRVcmwsIGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Jlc29sdmVTdHlsZVN0YXRlbWVudHMocGxhaW5TdHlsZXMpLCBbcGxhaW5TdHlsZXMuc3R5bGVzVmFyXSksXG4gICAgICB0aGlzLl9jb2RlZ2VuU291cmNlTW9kdWxlKF9zdHlsZXNNb2R1bGVVcmwoc3R5bGVzaGVldFVybCwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZXNvbHZlU3R5bGVTdGF0ZW1lbnRzKHNoaW1TdHlsZXMpLCBbc2hpbVN0eWxlcy5zdHlsZXNWYXJdKVxuICAgIF07XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlQ29tcG9uZW50KGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSk6IHN0cmluZyB7XG4gICAgdmFyIHN0eWxlUmVzdWx0ID0gdGhpcy5fc3R5bGVDb21waWxlci5jb21waWxlQ29tcG9uZW50KGNvbXBNZXRhKTtcbiAgICB2YXIgcGFyc2VkVGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZVBhcnNlci5wYXJzZShjb21wTWV0YSwgY29tcE1ldGEudGVtcGxhdGUudGVtcGxhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlcywgcGlwZXMsIGNvbXBNZXRhLnR5cGUubmFtZSk7XG4gICAgdmFyIHZpZXdSZXN1bHQgPSB0aGlzLl92aWV3Q29tcGlsZXIuY29tcGlsZUNvbXBvbmVudChjb21wTWV0YSwgcGFyc2VkVGVtcGxhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnZhcmlhYmxlKHN0eWxlUmVzdWx0LnN0eWxlc1ZhciksIHBpcGVzKTtcbiAgICBMaXN0V3JhcHBlci5hZGRBbGwodGFyZ2V0U3RhdGVtZW50cywgX3Jlc29sdmVTdHlsZVN0YXRlbWVudHMoc3R5bGVSZXN1bHQpKTtcbiAgICBMaXN0V3JhcHBlci5hZGRBbGwodGFyZ2V0U3RhdGVtZW50cywgX3Jlc29sdmVWaWV3U3RhdGVtZW50cyh2aWV3UmVzdWx0KSk7XG4gICAgcmV0dXJuIHZpZXdSZXN1bHQudmlld0ZhY3RvcnlWYXI7XG4gIH1cblxuXG4gIHByaXZhdGUgX2NvZGVnZW5Tb3VyY2VNb2R1bGUobW9kdWxlVXJsOiBzdHJpbmcsIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0ZWRWYXJzOiBzdHJpbmdbXSk6IFNvdXJjZU1vZHVsZSB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VNb2R1bGUoXG4gICAgICAgIG1vZHVsZVVybCwgdGhpcy5fb3V0cHV0RW1pdHRlci5lbWl0U3RhdGVtZW50cyhtb2R1bGVVcmwsIHN0YXRlbWVudHMsIGV4cG9ydGVkVmFycykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9yZXNvbHZlVmlld1N0YXRlbWVudHMoY29tcGlsZVJlc3VsdDogVmlld0NvbXBpbGVSZXN1bHQpOiBvLlN0YXRlbWVudFtdIHtcbiAgY29tcGlsZVJlc3VsdC5kZXBlbmRlbmNpZXMuZm9yRWFjaChcbiAgICAgIChkZXApID0+IHsgZGVwLmZhY3RvcnlQbGFjZWhvbGRlci5tb2R1bGVVcmwgPSBfdGVtcGxhdGVNb2R1bGVVcmwoZGVwLmNvbXApOyB9KTtcbiAgcmV0dXJuIGNvbXBpbGVSZXN1bHQuc3RhdGVtZW50cztcbn1cblxuXG5mdW5jdGlvbiBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhjb21waWxlUmVzdWx0OiBTdHlsZXNDb21waWxlUmVzdWx0KTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbXBpbGVSZXN1bHQuZGVwZW5kZW5jaWVzLmZvckVhY2goKGRlcCkgPT4ge1xuICAgIGRlcC52YWx1ZVBsYWNlaG9sZGVyLm1vZHVsZVVybCA9IF9zdHlsZXNNb2R1bGVVcmwoZGVwLnNvdXJjZVVybCwgZGVwLmlzU2hpbW1lZCk7XG4gIH0pO1xuICByZXR1cm4gY29tcGlsZVJlc3VsdC5zdGF0ZW1lbnRzO1xufVxuXG5mdW5jdGlvbiBfdGVtcGxhdGVNb2R1bGVVcmwoY29tcDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTogc3RyaW5nIHtcbiAgdmFyIG1vZHVsZVVybCA9IGNvbXAudHlwZS5tb2R1bGVVcmw7XG4gIHZhciB1cmxXaXRob3V0U3VmZml4ID0gbW9kdWxlVXJsLnN1YnN0cmluZygwLCBtb2R1bGVVcmwubGVuZ3RoIC0gTU9EVUxFX1NVRkZJWC5sZW5ndGgpO1xuICByZXR1cm4gYCR7dXJsV2l0aG91dFN1ZmZpeH0ubmdmYWN0b3J5JHtNT0RVTEVfU1VGRklYfWA7XG59XG5cbmZ1bmN0aW9uIF9zdHlsZXNNb2R1bGVVcmwoc3R5bGVzaGVldFVybDogc3RyaW5nLCBzaGltOiBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuIHNoaW0gPyBgJHtzdHlsZXNoZWV0VXJsfS5zaGltJHtNT0RVTEVfU1VGRklYfWAgOiBgJHtzdHlsZXNoZWV0VXJsfSR7TU9EVUxFX1NVRkZJWH1gO1xufVxuXG5mdW5jdGlvbiBfYXNzZXJ0Q29tcG9uZW50KG1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkge1xuICBpZiAoIW1ldGEuaXNDb21wb25lbnQpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ291bGQgbm90IGNvbXBpbGUgJyR7bWV0YS50eXBlLm5hbWV9JyBiZWNhdXNlIGl0IGlzIG5vdCBhIGNvbXBvbmVudC5gKTtcbiAgfVxufVxuIl19