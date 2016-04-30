import { assertionsEnabled } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { getDebugNode } from 'angular2/src/core/debug/debug_node';
import { DomRootRenderer } from 'angular2/src/platform/dom/dom_renderer';
import { RootRenderer, NgZone, ApplicationRef } from 'angular2/core';
import { DebugDomRootRenderer } from 'angular2/src/core/debug/debug_renderer';
const CORE_TOKENS = { 'ApplicationRef': ApplicationRef, 'NgZone': NgZone };
const INSPECT_GLOBAL_NAME = 'ng.probe';
const CORE_TOKENS_GLOBAL_NAME = 'ng.coreTokens';
/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElement(element) {
    return getDebugNode(element);
}
function _createConditionalRootRenderer(rootRenderer) {
    if (assertionsEnabled()) {
        return _createRootRenderer(rootRenderer);
    }
    return rootRenderer;
}
function _createRootRenderer(rootRenderer) {
    DOM.setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
    DOM.setGlobalVar(CORE_TOKENS_GLOBAL_NAME, CORE_TOKENS);
    return new DebugDomRootRenderer(rootRenderer);
}
/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export const ELEMENT_PROBE_PROVIDERS = [
    /*@ts2dart_Provider*/ {
        provide: RootRenderer,
        useFactory: _createConditionalRootRenderer,
        deps: [DomRootRenderer]
    }
];
export const ELEMENT_PROBE_PROVIDERS_PROD_MODE = [
    /*@ts2dart_Provider*/ {
        provide: RootRenderer,
        useFactory: _createRootRenderer,
        deps: [DomRootRenderer]
    }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcHJvYmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWc5NFJCSkoyLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RlYnVnL25nX3Byb2JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwwQkFBMEI7T0FDbkQsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFBWSxZQUFZLEVBQUMsTUFBTSxvQ0FBb0M7T0FDbkUsRUFBQyxlQUFlLEVBQUMsTUFBTSx3Q0FBd0M7T0FDL0QsRUFBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBQyxNQUFNLGVBQWU7T0FDM0QsRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHdDQUF3QztBQUUzRSxNQUFNLFdBQVcsR0FBc0IsRUFBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBQyxDQUFDO0FBRTVGLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0FBQ3ZDLE1BQU0sdUJBQXVCLEdBQUcsZUFBZSxDQUFDO0FBRWhEOzs7O0dBSUc7QUFDSCxxQ0FBcUMsT0FBTztJQUMxQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFFRCx3Q0FBd0MsWUFBWTtJQUNsRCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QixNQUFNLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVELDZCQUE2QixZQUFZO0lBQ3ZDLEdBQUcsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUM1RCxHQUFHLENBQUMsWUFBWSxDQUFDLHVCQUF1QixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRDs7R0FFRztBQUNILE9BQU8sTUFBTSx1QkFBdUIsR0FBNEI7SUFDOUQscUJBQXFCLENBQUM7UUFDcEIsT0FBTyxFQUFFLFlBQVk7UUFDckIsVUFBVSxFQUFFLDhCQUE4QjtRQUMxQyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUM7S0FDeEI7Q0FDRixDQUFDO0FBRUYsT0FBTyxNQUFNLGlDQUFpQyxHQUE0QjtJQUN4RSxxQkFBcUIsQ0FBQztRQUNwQixPQUFPLEVBQUUsWUFBWTtRQUNyQixVQUFVLEVBQUUsbUJBQW1CO1FBQy9CLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQztLQUN4QjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2Fzc2VydGlvbnNFbmFibGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtEZWJ1Z05vZGUsIGdldERlYnVnTm9kZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGVidWcvZGVidWdfbm9kZSc7XG5pbXBvcnQge0RvbVJvb3RSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fcmVuZGVyZXInO1xuaW1wb3J0IHtSb290UmVuZGVyZXIsIE5nWm9uZSwgQXBwbGljYXRpb25SZWZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtEZWJ1Z0RvbVJvb3RSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGVidWcvZGVidWdfcmVuZGVyZXInO1xuXG5jb25zdCBDT1JFX1RPS0VOUyA9IC8qQHRzMmRhcnRfY29uc3QqLyB7J0FwcGxpY2F0aW9uUmVmJzogQXBwbGljYXRpb25SZWYsICdOZ1pvbmUnOiBOZ1pvbmV9O1xuXG5jb25zdCBJTlNQRUNUX0dMT0JBTF9OQU1FID0gJ25nLnByb2JlJztcbmNvbnN0IENPUkVfVE9LRU5TX0dMT0JBTF9OQU1FID0gJ25nLmNvcmVUb2tlbnMnO1xuXG4vKipcbiAqIFJldHVybnMgYSB7QGxpbmsgRGVidWdFbGVtZW50fSBmb3IgdGhlIGdpdmVuIG5hdGl2ZSBET00gZWxlbWVudCwgb3JcbiAqIG51bGwgaWYgdGhlIGdpdmVuIG5hdGl2ZSBlbGVtZW50IGRvZXMgbm90IGhhdmUgYW4gQW5ndWxhciB2aWV3IGFzc29jaWF0ZWRcbiAqIHdpdGggaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNwZWN0TmF0aXZlRWxlbWVudChlbGVtZW50KTogRGVidWdOb2RlIHtcbiAgcmV0dXJuIGdldERlYnVnTm9kZShlbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNvbmRpdGlvbmFsUm9vdFJlbmRlcmVyKHJvb3RSZW5kZXJlcikge1xuICBpZiAoYXNzZXJ0aW9uc0VuYWJsZWQoKSkge1xuICAgIHJldHVybiBfY3JlYXRlUm9vdFJlbmRlcmVyKHJvb3RSZW5kZXJlcik7XG4gIH1cbiAgcmV0dXJuIHJvb3RSZW5kZXJlcjtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVJvb3RSZW5kZXJlcihyb290UmVuZGVyZXIpIHtcbiAgRE9NLnNldEdsb2JhbFZhcihJTlNQRUNUX0dMT0JBTF9OQU1FLCBpbnNwZWN0TmF0aXZlRWxlbWVudCk7XG4gIERPTS5zZXRHbG9iYWxWYXIoQ09SRV9UT0tFTlNfR0xPQkFMX05BTUUsIENPUkVfVE9LRU5TKTtcbiAgcmV0dXJuIG5ldyBEZWJ1Z0RvbVJvb3RSZW5kZXJlcihyb290UmVuZGVyZXIpO1xufVxuXG4vKipcbiAqIFByb3ZpZGVycyB3aGljaCBzdXBwb3J0IGRlYnVnZ2luZyBBbmd1bGFyIGFwcGxpY2F0aW9ucyAoZS5nLiB2aWEgYG5nLnByb2JlYCkuXG4gKi9cbmV4cG9ydCBjb25zdCBFTEVNRU5UX1BST0JFX1BST1ZJREVSUzogYW55W10gPSAvKkB0czJkYXJ0X2NvbnN0Ki9bXG4gIC8qQHRzMmRhcnRfUHJvdmlkZXIqLyB7XG4gICAgcHJvdmlkZTogUm9vdFJlbmRlcmVyLFxuICAgIHVzZUZhY3Rvcnk6IF9jcmVhdGVDb25kaXRpb25hbFJvb3RSZW5kZXJlcixcbiAgICBkZXBzOiBbRG9tUm9vdFJlbmRlcmVyXVxuICB9XG5dO1xuXG5leHBvcnQgY29uc3QgRUxFTUVOVF9QUk9CRV9QUk9WSURFUlNfUFJPRF9NT0RFOiBhbnlbXSA9IC8qQHRzMmRhcnRfY29uc3QqL1tcbiAgLypAdHMyZGFydF9Qcm92aWRlciovIHtcbiAgICBwcm92aWRlOiBSb290UmVuZGVyZXIsXG4gICAgdXNlRmFjdG9yeTogX2NyZWF0ZVJvb3RSZW5kZXJlcixcbiAgICBkZXBzOiBbRG9tUm9vdFJlbmRlcmVyXVxuICB9XG5dO1xuIl19