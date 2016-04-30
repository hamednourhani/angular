'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var template_ast_1 = require('../template_ast');
var property_binder_1 = require('./property_binder');
var event_binder_1 = require('./event_binder');
var lifecycle_binder_1 = require('./lifecycle_binder');
function bindView(view, parsedTemplate) {
    var visitor = new ViewBinderVisitor(view);
    template_ast_1.templateVisitAll(visitor, parsedTemplate);
    view.pipes.forEach(function (pipe) { lifecycle_binder_1.bindPipeDestroyLifecycleCallbacks(pipe.meta, pipe.instance, pipe.view); });
}
exports.bindView = bindView;
var ViewBinderVisitor = (function () {
    function ViewBinderVisitor(view) {
        this.view = view;
        this._nodeIndex = 0;
    }
    ViewBinderVisitor.prototype.visitBoundText = function (ast, parent) {
        var node = this.view.nodes[this._nodeIndex++];
        property_binder_1.bindRenderText(ast, node, this.view);
        return null;
    };
    ViewBinderVisitor.prototype.visitText = function (ast, parent) {
        this._nodeIndex++;
        return null;
    };
    ViewBinderVisitor.prototype.visitNgContent = function (ast, parent) { return null; };
    ViewBinderVisitor.prototype.visitElement = function (ast, parent) {
        var compileElement = this.view.nodes[this._nodeIndex++];
        var eventListeners = event_binder_1.collectEventListeners(ast.outputs, ast.directives, compileElement);
        property_binder_1.bindRenderInputs(ast.inputs, compileElement);
        event_binder_1.bindRenderOutputs(eventListeners);
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            var directiveInstance = compileElement.directiveInstances[index];
            property_binder_1.bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
            lifecycle_binder_1.bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);
            property_binder_1.bindDirectiveHostProps(directiveAst, directiveInstance, compileElement);
            event_binder_1.bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
        });
        template_ast_1.templateVisitAll(this, ast.children, compileElement);
        // afterContent and afterView lifecycles need to be called bottom up
        // so that children are notified before parents
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            var directiveInstance = compileElement.directiveInstances[index];
            lifecycle_binder_1.bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            lifecycle_binder_1.bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            lifecycle_binder_1.bindDirectiveDestroyLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
        });
        return null;
    };
    ViewBinderVisitor.prototype.visitEmbeddedTemplate = function (ast, parent) {
        var compileElement = this.view.nodes[this._nodeIndex++];
        var eventListeners = event_binder_1.collectEventListeners(ast.outputs, ast.directives, compileElement);
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            var directiveInstance = compileElement.directiveInstances[index];
            property_binder_1.bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
            lifecycle_binder_1.bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);
            event_binder_1.bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
            lifecycle_binder_1.bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            lifecycle_binder_1.bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            lifecycle_binder_1.bindDirectiveDestroyLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
        });
        bindView(compileElement.embeddedView, ast.children);
        return null;
    };
    ViewBinderVisitor.prototype.visitAttr = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitDirective = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitEvent = function (ast, eventTargetAndNames) {
        return null;
    };
    ViewBinderVisitor.prototype.visitReference = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitVariable = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitDirectiveProperty = function (ast, context) { return null; };
    ViewBinderVisitor.prototype.visitElementProperty = function (ast, context) { return null; };
    return ViewBinderVisitor;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19iaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZNWkxBTElHLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvdmlld19jb21waWxlci92aWV3X2JpbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBRU8sZ0NBQWdDLENBQUMsQ0FBQTtBQUN4Qyw2QkFrQk8saUJBQWlCLENBQUMsQ0FBQTtBQUN6QixnQ0FLTyxtQkFBbUIsQ0FBQyxDQUFBO0FBQzNCLDZCQUE2RSxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzlGLGlDQU1PLG9CQUFvQixDQUFDLENBQUE7QUFJNUIsa0JBQXlCLElBQWlCLEVBQUUsY0FBNkI7SUFDdkUsSUFBSSxPQUFPLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQywrQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQ2QsVUFBQyxJQUFJLElBQU8sb0RBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdGLENBQUM7QUFMZSxnQkFBUSxXQUt2QixDQUFBO0FBRUQ7SUFHRSwyQkFBbUIsSUFBaUI7UUFBakIsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUY1QixlQUFVLEdBQVcsQ0FBQyxDQUFDO0lBRVEsQ0FBQztJQUV4QywwQ0FBYyxHQUFkLFVBQWUsR0FBaUIsRUFBRSxNQUFzQjtRQUN0RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM5QyxnQ0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUks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LHdCQUFDO0FBQUQsQ0FBQyxBQTFFRCxJQTBFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIExpc3RXcmFwcGVyLFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgVGVtcGxhdGVBc3QsXG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgTmdDb250ZW50QXN0LFxuICBFbWJlZGRlZFRlbXBsYXRlQXN0LFxuICBFbGVtZW50QXN0LFxuICBSZWZlcmVuY2VBc3QsXG4gIFZhcmlhYmxlQXN0LFxuICBCb3VuZEV2ZW50QXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCxcbiAgQXR0ckFzdCxcbiAgQm91bmRUZXh0QXN0LFxuICBUZXh0QXN0LFxuICBEaXJlY3RpdmVBc3QsXG4gIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsXG4gIHRlbXBsYXRlVmlzaXRBbGwsXG4gIFByb3BlcnR5QmluZGluZ1R5cGUsXG4gIFByb3ZpZGVyQXN0XG59IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge1xuICBiaW5kUmVuZGVyVGV4dCxcbiAgYmluZFJlbmRlcklucHV0cyxcbiAgYmluZERpcmVjdGl2ZUlucHV0cyxcbiAgYmluZERpcmVjdGl2ZUhvc3RQcm9wc1xufSBmcm9tICcuL3Byb3BlcnR5X2JpbmRlcic7XG5pbXBvcnQge2JpbmRSZW5kZXJPdXRwdXRzLCBjb2xsZWN0RXZlbnRMaXN0ZW5lcnMsIGJpbmREaXJlY3RpdmVPdXRwdXRzfSBmcm9tICcuL2V2ZW50X2JpbmRlcic7XG5pbXBvcnQge1xuICBiaW5kRGlyZWN0aXZlQWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzLFxuICBiaW5kRGlyZWN0aXZlQWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzLFxuICBiaW5kRGlyZWN0aXZlRGVzdHJveUxpZmVjeWNsZUNhbGxiYWNrcyxcbiAgYmluZFBpcGVEZXN0cm95TGlmZWN5Y2xlQ2FsbGJhY2tzLFxuICBiaW5kRGlyZWN0aXZlRGV0ZWN0Q2hhbmdlc0xpZmVjeWNsZUNhbGxiYWNrc1xufSBmcm9tICcuL2xpZmVjeWNsZV9iaW5kZXInO1xuaW1wb3J0IHtDb21waWxlVmlld30gZnJvbSAnLi9jb21waWxlX3ZpZXcnO1xuaW1wb3J0IHtDb21waWxlRWxlbWVudCwgQ29tcGlsZU5vZGV9IGZyb20gJy4vY29tcGlsZV9lbGVtZW50JztcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRWaWV3KHZpZXc6IENvbXBpbGVWaWV3LCBwYXJzZWRUZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSk6IHZvaWQge1xuICB2YXIgdmlzaXRvciA9IG5ldyBWaWV3QmluZGVyVmlzaXRvcih2aWV3KTtcbiAgdGVtcGxhdGVWaXNpdEFsbCh2aXNpdG9yLCBwYXJzZWRUZW1wbGF0ZSk7XG4gIHZpZXcucGlwZXMuZm9yRWFjaChcbiAgICAgIChwaXBlKSA9PiB7IGJpbmRQaXBlRGVzdHJveUxpZmVjeWNsZUNhbGxiYWNrcyhwaXBlLm1ldGEsIHBpcGUuaW5zdGFuY2UsIHBpcGUudmlldyk7IH0pO1xufVxuXG5jbGFzcyBWaWV3QmluZGVyVmlzaXRvciBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgX25vZGVJbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmlldzogQ29tcGlsZVZpZXcpIHt9XG5cbiAgdmlzaXRCb3VuZFRleHQoYXN0OiBCb3VuZFRleHRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHZhciBub2RlID0gdGhpcy52aWV3Lm5vZGVzW3RoaXMuX25vZGVJbmRleCsrXTtcbiAgICBiaW5kUmVuZGVyVGV4dChhc3QsIG5vZGUsIHRoaXMudmlldyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRUZXh0KGFzdDogVGV4dEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgdGhpcy5fbm9kZUluZGV4Kys7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdE5nQ29udGVudChhc3Q6IE5nQ29udGVudEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgdmFyIGNvbXBpbGVFbGVtZW50ID0gPENvbXBpbGVFbGVtZW50PnRoaXMudmlldy5ub2Rlc1t0aGlzLl9ub2RlSW5kZXgrK107XG4gICAgdmFyIGV2ZW50TGlzdGVuZXJzID0gY29sbGVjdEV2ZW50TGlzdGVuZXJzKGFzdC5vdXRwdXRzLCBhc3QuZGlyZWN0aXZlcywgY29tcGlsZUVsZW1lbnQpO1xuICAgIGJpbmRSZW5kZXJJbnB1dHMoYXN0LmlucHV0cywgY29tcGlsZUVsZW1lbnQpO1xuICAgIGJpbmRSZW5kZXJPdXRwdXRzKGV2ZW50TGlzdGVuZXJzKTtcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGFzdC5kaXJlY3RpdmVzLCAoZGlyZWN0aXZlQXN0LCBpbmRleCkgPT4ge1xuICAgICAgdmFyIGRpcmVjdGl2ZUluc3RhbmNlID0gY29tcGlsZUVsZW1lbnQuZGlyZWN0aXZlSW5zdGFuY2VzW2luZGV4XTtcbiAgICAgIGJpbmREaXJlY3RpdmVJbnB1dHMoZGlyZWN0aXZlQXN0LCBkaXJlY3RpdmVJbnN0YW5jZSwgY29tcGlsZUVsZW1lbnQpO1xuICAgICAgYmluZERpcmVjdGl2ZURldGVjdENoYW5nZXNMaWZlY3ljbGVDYWxsYmFja3MoZGlyZWN0aXZlQXN0LCBkaXJlY3RpdmVJbnN0YW5jZSwgY29tcGlsZUVsZW1lbnQpO1xuXG4gICAgICBiaW5kRGlyZWN0aXZlSG9zdFByb3BzKGRpcmVjdGl2ZUFzdCwgZGlyZWN0aXZlSW5zdGFuY2UsIGNvbXBpbGVFbGVtZW50KTtcbiAgICAgIGJpbmREaXJlY3RpdmVPdXRwdXRzKGRpcmVjdGl2ZUFzdCwgZGlyZWN0aXZlSW5zdGFuY2UsIGV2ZW50TGlzdGVuZXJzKTtcbiAgICB9KTtcbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbiwgY29tcGlsZUVsZW1lbnQpO1xuICAgIC8vIGFmdGVyQ29udGVudCBhbmQgYWZ0ZXJWaWV3IGxpZmVjeWNsZXMgbmVlZCB0byBiZSBjYWxsZWQgYm90dG9tIHVwXG4gICAgLy8gc28gdGhhdCBjaGlsZHJlbiBhcmUgbm90aWZpZWQgYmVmb3JlIHBhcmVudHNcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGFzdC5kaXJlY3RpdmVzLCAoZGlyZWN0aXZlQXN0LCBpbmRleCkgPT4ge1xuICAgICAgdmFyIGRpcmVjdGl2ZUluc3RhbmNlID0gY29tcGlsZUVsZW1lbnQuZGlyZWN0aXZlSW5zdGFuY2VzW2luZGV4XTtcbiAgICAgIGJpbmREaXJlY3RpdmVBZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3MoZGlyZWN0aXZlQXN0LmRpcmVjdGl2ZSwgZGlyZWN0aXZlSW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50KTtcbiAgICAgIGJpbmREaXJlY3RpdmVBZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3MoZGlyZWN0aXZlQXN0LmRpcmVjdGl2ZSwgZGlyZWN0aXZlSW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50KTtcbiAgICAgIGJpbmREaXJlY3RpdmVEZXN0cm95TGlmZWN5Y2xlQ2FsbGJhY2tzKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUsIGRpcmVjdGl2ZUluc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdDogRW1iZWRkZWRUZW1wbGF0ZUFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgdmFyIGNvbXBpbGVFbGVtZW50ID0gPENvbXBpbGVFbGVtZW50PnRoaXMudmlldy5ub2Rlc1t0aGlzLl9ub2RlSW5kZXgrK107XG4gICAgdmFyIGV2ZW50TGlzdGVuZXJzID0gY29sbGVjdEV2ZW50TGlzdGVuZXJzKGFzdC5vdXRwdXRzLCBhc3QuZGlyZWN0aXZlcywgY29tcGlsZUVsZW1lbnQpO1xuICAgIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgoYXN0LmRpcmVjdGl2ZXMsIChkaXJlY3RpdmVBc3QsIGluZGV4KSA9PiB7XG4gICAgICB2YXIgZGlyZWN0aXZlSW5zdGFuY2UgPSBjb21waWxlRWxlbWVudC5kaXJlY3RpdmVJbnN0YW5jZXNbaW5kZXhdO1xuICAgICAgYmluZERpcmVjdGl2ZUlucHV0cyhkaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCBjb21waWxlRWxlbWVudCk7XG4gICAgICBiaW5kRGlyZWN0aXZlRGV0ZWN0Q2hhbmdlc0xpZmVjeWNsZUNhbGxiYWNrcyhkaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCBjb21waWxlRWxlbWVudCk7XG4gICAgICBiaW5kRGlyZWN0aXZlT3V0cHV0cyhkaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCBldmVudExpc3RlbmVycyk7XG4gICAgICBiaW5kRGlyZWN0aXZlQWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUsIGRpcmVjdGl2ZUluc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudCk7XG4gICAgICBiaW5kRGlyZWN0aXZlQWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUsIGRpcmVjdGl2ZUluc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudCk7XG4gICAgICBiaW5kRGlyZWN0aXZlRGVzdHJveUxpZmVjeWNsZUNhbGxiYWNrcyhkaXJlY3RpdmVBc3QuZGlyZWN0aXZlLCBkaXJlY3RpdmVJbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50KTtcbiAgICB9KTtcbiAgICBiaW5kVmlldyhjb21waWxlRWxlbWVudC5lbWJlZGRlZFZpZXcsIGFzdC5jaGlsZHJlbik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RXZlbnQoYXN0OiBCb3VuZEV2ZW50QXN0LCBldmVudFRhcmdldEFuZE5hbWVzOiBNYXA8c3RyaW5nLCBCb3VuZEV2ZW50QXN0Pik6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdFJlZmVyZW5jZShhc3Q6IFJlZmVyZW5jZUFzdCwgY3R4OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG4iXX0=