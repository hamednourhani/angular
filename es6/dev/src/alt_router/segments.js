import { StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent, stringify } from 'angular2/src/facade/lang';
export class Tree {
    constructor(root) {
        this._root = root;
    }
    get root() { return this._root.value; }
    parent(t) {
        let p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    }
    children(t) {
        let n = _findNode(t, this._root);
        return isPresent(n) ? n.children.map(t => t.value) : null;
    }
    firstChild(t) {
        let n = _findNode(t, this._root);
        return isPresent(n) && n.children.length > 0 ? n.children[0].value : null;
    }
    pathFromRoot(t) { return _findPath(t, this._root, []).map(s => s.value); }
}
export function rootNode(tree) {
    return tree._root;
}
function _findNode(expected, c) {
    // TODO: vsavkin remove it once recognize is fixed
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
        return c;
    if (expected === c.value)
        return c;
    for (let cc of c.children) {
        let r = _findNode(expected, cc);
        if (isPresent(r))
            return r;
    }
    return null;
}
function _findPath(expected, c, collected) {
    collected.push(c);
    // TODO: vsavkin remove it once recognize is fixed
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
        return collected;
    if (expected === c.value)
        return collected;
    for (let cc of c.children) {
        let r = _findPath(expected, cc, ListWrapper.clone(collected));
        if (isPresent(r))
            return r;
    }
    return null;
}
export class TreeNode {
    constructor(value, children) {
        this.value = value;
        this.children = children;
    }
}
export class UrlSegment {
    constructor(segment, parameters, outlet) {
        this.segment = segment;
        this.parameters = parameters;
        this.outlet = outlet;
    }
    toString() {
        let outletPrefix = isBlank(this.outlet) ? "" : `${this.outlet}:`;
        let segmentPrefix = isBlank(this.segment) ? "" : this.segment;
        return `${outletPrefix}${segmentPrefix}${_serializeParams(this.parameters)}`;
    }
}
function _serializeParams(params) {
    let res = "";
    if (isPresent(params)) {
        StringMapWrapper.forEach(params, (v, k) => res += `;${k}=${v}`);
    }
    return res;
}
export class RouteSegment {
    constructor(urlSegments, parameters, outlet, type, componentFactory) {
        this.urlSegments = urlSegments;
        this.parameters = parameters;
        this.outlet = outlet;
        this._type = type;
        this._componentFactory = componentFactory;
    }
    getParam(param) {
        return isPresent(this.parameters) ? this.parameters[param] : null;
    }
    get type() { return this._type; }
    get stringifiedUrlSegments() { return this.urlSegments.map(s => s.toString()).join("/"); }
}
export function serializeRouteSegmentTree(tree) {
    return _serializeRouteSegmentTree(tree._root);
}
function _serializeRouteSegmentTree(node) {
    let v = node.value;
    let children = node.children.map(c => _serializeRouteSegmentTree(c)).join(", ");
    return `${v.outlet}:${v.stringifiedUrlSegments}(${stringify(v.type)}) [${children}]`;
}
export function equalSegments(a, b) {
    if (isBlank(a) && !isBlank(b))
        return false;
    if (!isBlank(a) && isBlank(b))
        return false;
    if (a._type !== b._type)
        return false;
    if (isBlank(a.parameters) && !isBlank(b.parameters))
        return false;
    if (!isBlank(a.parameters) && isBlank(b.parameters))
        return false;
    if (isBlank(a.parameters) && isBlank(b.parameters))
        return true;
    return StringMapWrapper.equals(a.parameters, b.parameters);
}
export function routeSegmentComponentFactory(a) {
    return a._componentFactory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWc5NFJCSkoyLnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9zZWdtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FDTyxFQUFDLGdCQUFnQixFQUFFLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNyRSxFQUFPLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO0FBRTVFO0lBSUUsWUFBWSxJQUFpQjtRQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQUMsQ0FBQztJQUVyRCxJQUFJLElBQUksS0FBUSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sQ0FBQyxDQUFJO1FBQ1QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQy9DLENBQUM7SUFFRCxRQUFRLENBQUMsQ0FBSTtRQUNYLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDNUQsQ0FBQztJQUVELFVBQVUsQ0FBQyxDQUFJO1FBQ2IsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQzVFLENBQUM7SUFFRCxZQUFZLENBQUMsQ0FBSSxJQUFTLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFFRCx5QkFBNEIsSUFBYTtJQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNwQixDQUFDO0FBRUQsbUJBQXNCLFFBQVcsRUFBRSxDQUFjO0lBQy9DLGtEQUFrRDtJQUNsRCxFQUFFLENBQUMsQ0FBQyxRQUFRLFlBQVksWUFBWSxJQUFJLGFBQWEsQ0FBTSxRQUFRLEVBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM3RixFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbkMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNoQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELG1CQUFzQixRQUFXLEVBQUUsQ0FBYyxFQUFFLFNBQXdCO0lBQ3pFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbEIsa0RBQWtEO0lBQ2xELEVBQUUsQ0FBQyxDQUFDLFFBQVEsWUFBWSxZQUFZLElBQUksYUFBYSxDQUFNLFFBQVEsRUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakYsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNuQixFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDM0MsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7SUFDRSxZQUFtQixLQUFRLEVBQVMsUUFBdUI7UUFBeEMsVUFBSyxHQUFMLEtBQUssQ0FBRztRQUFTLGFBQVEsR0FBUixRQUFRLENBQWU7SUFBRyxDQUFDO0FBQ2pFLENBQUM7QUFFRDtJQUNFLFlBQW1CLE9BQVksRUFBUyxVQUFtQyxFQUN4RCxNQUFjO1FBRGQsWUFBTyxHQUFQLE9BQU8sQ0FBSztRQUFTLGVBQVUsR0FBVixVQUFVLENBQXlCO1FBQ3hELFdBQU0sR0FBTixNQUFNLENBQVE7SUFBRyxDQUFDO0lBRXJDLFFBQVE7UUFDTixJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUNqRSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzlELE1BQU0sQ0FBQyxHQUFHLFlBQVksR0FBRyxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7SUFDL0UsQ0FBQztBQUNILENBQUM7QUFFRCwwQkFBMEIsTUFBK0I7SUFDdkQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRDtJQU9FLFlBQW1CLFdBQXlCLEVBQVMsVUFBbUMsRUFDckUsTUFBYyxFQUFFLElBQVUsRUFBRSxnQkFBa0M7UUFEOUQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtRQUNyRSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztJQUM1QyxDQUFDO0lBRUQsUUFBUSxDQUFDLEtBQWE7UUFDcEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDcEUsQ0FBQztJQUVELElBQUksSUFBSSxLQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUV2QyxJQUFJLHNCQUFzQixLQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRUQsMENBQTBDLElBQXdCO0lBQ2hFLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVELG9DQUFvQyxJQUE0QjtJQUM5RCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ25CLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSwwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxzQkFBc0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLFFBQVEsR0FBRyxDQUFDO0FBQ3ZGLENBQUM7QUFFRCw4QkFBOEIsQ0FBZSxFQUFFLENBQWU7SUFDNUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQzVDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDdEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2xFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNsRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVELDZDQUE2QyxDQUFlO0lBQzFELE1BQU0sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUM7QUFDN0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUeXBlLCBpc0JsYW5rLCBpc1ByZXNlbnQsIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IGNsYXNzIFRyZWU8VD4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9yb290OiBUcmVlTm9kZTxUPjtcblxuICBjb25zdHJ1Y3Rvcihyb290OiBUcmVlTm9kZTxUPikgeyB0aGlzLl9yb290ID0gcm9vdDsgfVxuXG4gIGdldCByb290KCk6IFQgeyByZXR1cm4gdGhpcy5fcm9vdC52YWx1ZTsgfVxuXG4gIHBhcmVudCh0OiBUKTogVCB7XG4gICAgbGV0IHAgPSB0aGlzLnBhdGhGcm9tUm9vdCh0KTtcbiAgICByZXR1cm4gcC5sZW5ndGggPiAxID8gcFtwLmxlbmd0aCAtIDJdIDogbnVsbDtcbiAgfVxuXG4gIGNoaWxkcmVuKHQ6IFQpOiBUW10ge1xuICAgIGxldCBuID0gX2ZpbmROb2RlKHQsIHRoaXMuX3Jvb3QpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobikgPyBuLmNoaWxkcmVuLm1hcCh0ID0+IHQudmFsdWUpIDogbnVsbDtcbiAgfVxuXG4gIGZpcnN0Q2hpbGQodDogVCk6IFQge1xuICAgIGxldCBuID0gX2ZpbmROb2RlKHQsIHRoaXMuX3Jvb3QpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobikgJiYgbi5jaGlsZHJlbi5sZW5ndGggPiAwID8gbi5jaGlsZHJlblswXS52YWx1ZSA6IG51bGw7XG4gIH1cblxuICBwYXRoRnJvbVJvb3QodDogVCk6IFRbXSB7IHJldHVybiBfZmluZFBhdGgodCwgdGhpcy5fcm9vdCwgW10pLm1hcChzID0+IHMudmFsdWUpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb290Tm9kZTxUPih0cmVlOiBUcmVlPFQ+KTogVHJlZU5vZGU8VD4ge1xuICByZXR1cm4gdHJlZS5fcm9vdDtcbn1cblxuZnVuY3Rpb24gX2ZpbmROb2RlPFQ+KGV4cGVjdGVkOiBULCBjOiBUcmVlTm9kZTxUPik6IFRyZWVOb2RlPFQ+IHtcbiAgLy8gVE9ETzogdnNhdmtpbiByZW1vdmUgaXQgb25jZSByZWNvZ25pemUgaXMgZml4ZWRcbiAgaWYgKGV4cGVjdGVkIGluc3RhbmNlb2YgUm91dGVTZWdtZW50ICYmIGVxdWFsU2VnbWVudHMoPGFueT5leHBlY3RlZCwgPGFueT5jLnZhbHVlKSkgcmV0dXJuIGM7XG4gIGlmIChleHBlY3RlZCA9PT0gYy52YWx1ZSkgcmV0dXJuIGM7XG4gIGZvciAobGV0IGNjIG9mIGMuY2hpbGRyZW4pIHtcbiAgICBsZXQgciA9IF9maW5kTm9kZShleHBlY3RlZCwgY2MpO1xuICAgIGlmIChpc1ByZXNlbnQocikpIHJldHVybiByO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBfZmluZFBhdGg8VD4oZXhwZWN0ZWQ6IFQsIGM6IFRyZWVOb2RlPFQ+LCBjb2xsZWN0ZWQ6IFRyZWVOb2RlPFQ+W10pOiBUcmVlTm9kZTxUPltdIHtcbiAgY29sbGVjdGVkLnB1c2goYyk7XG5cbiAgLy8gVE9ETzogdnNhdmtpbiByZW1vdmUgaXQgb25jZSByZWNvZ25pemUgaXMgZml4ZWRcbiAgaWYgKGV4cGVjdGVkIGluc3RhbmNlb2YgUm91dGVTZWdtZW50ICYmIGVxdWFsU2VnbWVudHMoPGFueT5leHBlY3RlZCwgPGFueT5jLnZhbHVlKSlcbiAgICByZXR1cm4gY29sbGVjdGVkO1xuICBpZiAoZXhwZWN0ZWQgPT09IGMudmFsdWUpIHJldHVybiBjb2xsZWN0ZWQ7XG4gIGZvciAobGV0IGNjIG9mIGMuY2hpbGRyZW4pIHtcbiAgICBsZXQgciA9IF9maW5kUGF0aChleHBlY3RlZCwgY2MsIExpc3RXcmFwcGVyLmNsb25lKGNvbGxlY3RlZCkpO1xuICAgIGlmIChpc1ByZXNlbnQocikpIHJldHVybiByO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjbGFzcyBUcmVlTm9kZTxUPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogVCwgcHVibGljIGNoaWxkcmVuOiBUcmVlTm9kZTxUPltdKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgVXJsU2VnbWVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWdtZW50OiBhbnksIHB1YmxpYyBwYXJhbWV0ZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgcHVibGljIG91dGxldDogc3RyaW5nKSB7fVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgbGV0IG91dGxldFByZWZpeCA9IGlzQmxhbmsodGhpcy5vdXRsZXQpID8gXCJcIiA6IGAke3RoaXMub3V0bGV0fTpgO1xuICAgIGxldCBzZWdtZW50UHJlZml4ID0gaXNCbGFuayh0aGlzLnNlZ21lbnQpID8gXCJcIiA6IHRoaXMuc2VnbWVudDtcbiAgICByZXR1cm4gYCR7b3V0bGV0UHJlZml4fSR7c2VnbWVudFByZWZpeH0ke19zZXJpYWxpemVQYXJhbXModGhpcy5wYXJhbWV0ZXJzKX1gO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9zZXJpYWxpemVQYXJhbXMocGFyYW1zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZyB7XG4gIGxldCByZXMgPSBcIlwiO1xuICBpZiAoaXNQcmVzZW50KHBhcmFtcykpIHtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocGFyYW1zLCAodiwgaykgPT4gcmVzICs9IGA7JHtrfT0ke3Z9YCk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IGNsYXNzIFJvdXRlU2VnbWVudCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3R5cGU6IFR5cGU7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdXJsU2VnbWVudHM6IFVybFNlZ21lbnRbXSwgcHVibGljIHBhcmFtZXRlcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICBwdWJsaWMgb3V0bGV0OiBzdHJpbmcsIHR5cGU6IFR5cGUsIGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3RvcnkpIHtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgICB0aGlzLl9jb21wb25lbnRGYWN0b3J5ID0gY29tcG9uZW50RmFjdG9yeTtcbiAgfVxuXG4gIGdldFBhcmFtKHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5wYXJhbWV0ZXJzKSA/IHRoaXMucGFyYW1ldGVyc1twYXJhbV0gOiBudWxsO1xuICB9XG5cbiAgZ2V0IHR5cGUoKTogVHlwZSB7IHJldHVybiB0aGlzLl90eXBlOyB9XG5cbiAgZ2V0IHN0cmluZ2lmaWVkVXJsU2VnbWVudHMoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudXJsU2VnbWVudHMubWFwKHMgPT4gcy50b1N0cmluZygpKS5qb2luKFwiL1wiKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplUm91dGVTZWdtZW50VHJlZSh0cmVlOiBUcmVlPFJvdXRlU2VnbWVudD4pOiBzdHJpbmcge1xuICByZXR1cm4gX3NlcmlhbGl6ZVJvdXRlU2VnbWVudFRyZWUodHJlZS5fcm9vdCk7XG59XG5cbmZ1bmN0aW9uIF9zZXJpYWxpemVSb3V0ZVNlZ21lbnRUcmVlKG5vZGU6IFRyZWVOb2RlPFJvdXRlU2VnbWVudD4pOiBzdHJpbmcge1xuICBsZXQgdiA9IG5vZGUudmFsdWU7XG4gIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4ubWFwKGMgPT4gX3NlcmlhbGl6ZVJvdXRlU2VnbWVudFRyZWUoYykpLmpvaW4oXCIsIFwiKTtcbiAgcmV0dXJuIGAke3Yub3V0bGV0fToke3Yuc3RyaW5naWZpZWRVcmxTZWdtZW50c30oJHtzdHJpbmdpZnkodi50eXBlKX0pIFske2NoaWxkcmVufV1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxTZWdtZW50cyhhOiBSb3V0ZVNlZ21lbnQsIGI6IFJvdXRlU2VnbWVudCk6IGJvb2xlYW4ge1xuICBpZiAoaXNCbGFuayhhKSAmJiAhaXNCbGFuayhiKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoIWlzQmxhbmsoYSkgJiYgaXNCbGFuayhiKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoYS5fdHlwZSAhPT0gYi5fdHlwZSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoaXNCbGFuayhhLnBhcmFtZXRlcnMpICYmICFpc0JsYW5rKGIucGFyYW1ldGVycykpIHJldHVybiBmYWxzZTtcbiAgaWYgKCFpc0JsYW5rKGEucGFyYW1ldGVycykgJiYgaXNCbGFuayhiLnBhcmFtZXRlcnMpKSByZXR1cm4gZmFsc2U7XG4gIGlmIChpc0JsYW5rKGEucGFyYW1ldGVycykgJiYgaXNCbGFuayhiLnBhcmFtZXRlcnMpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuZXF1YWxzKGEucGFyYW1ldGVycywgYi5wYXJhbWV0ZXJzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdXRlU2VnbWVudENvbXBvbmVudEZhY3RvcnkoYTogUm91dGVTZWdtZW50KTogQ29tcG9uZW50RmFjdG9yeSB7XG4gIHJldHVybiBhLl9jb21wb25lbnRGYWN0b3J5O1xufSJdfQ==