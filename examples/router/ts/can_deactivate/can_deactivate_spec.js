'use strict';"use strict";
var e2e_util_1 = require('angular2/src/testing/e2e_util');
var testing_1 = require('angular2/testing');
function waitForElement(selector) {
    var EC = protractor.ExpectedConditions;
    // Waits for the element with id 'abc' to be present on the dom.
    e2e_util_1.browser.wait(EC.presenceOf($(selector)), 20000);
}
function waitForAlert() {
    var EC = protractor.ExpectedConditions;
    e2e_util_1.browser.wait(EC.alertIsPresent(), 1000);
}
describe('can deactivate example app', function () {
    afterEach(e2e_util_1.verifyNoBrowserErrors);
    var URL = 'angular2/examples/router/ts/can_deactivate/';
    it('should not navigate away when prompt is cancelled', function () {
        e2e_util_1.browser.get(URL);
        waitForElement('note-index-cmp');
        element(by.css('#note-1-link')).click();
        waitForElement('note-cmp');
        e2e_util_1.browser.navigate().back();
        waitForAlert();
        e2e_util_1.browser.switchTo().alert().dismiss(); // Use to simulate cancel button
        testing_1.expect(element(by.css('note-cmp')).getText()).toContain('id: 1');
    });
    it('should navigate away when prompt is confirmed', function () {
        e2e_util_1.browser.get(URL);
        waitForElement('note-index-cmp');
        element(by.css('#note-1-link')).click();
        waitForElement('note-cmp');
        e2e_util_1.browser.navigate().back();
        waitForAlert();
        e2e_util_1.browser.switchTo().alert().accept();
        waitForElement('note-index-cmp');
        testing_1.expect(element(by.css('note-index-cmp')).getText()).toContain('Your Notes');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2RlYWN0aXZhdGVfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdGN3SHpzMmkudG1wL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZS9jYW5fZGVhY3RpdmF0ZV9zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx5QkFBNkMsK0JBQStCLENBQUMsQ0FBQTtBQUM3RSx3QkFBcUIsa0JBQWtCLENBQUMsQ0FBQTtBQUV4Qyx3QkFBd0IsUUFBZ0I7SUFDdEMsSUFBSSxFQUFFLEdBQVMsVUFBVyxDQUFDLGtCQUFrQixDQUFDO0lBQzlDLGdFQUFnRTtJQUNoRSxrQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFFRDtJQUNFLElBQUksRUFBRSxHQUFTLFVBQVcsQ0FBQyxrQkFBa0IsQ0FBQztJQUM5QyxrQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVELFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtJQUVyQyxTQUFTLENBQUMsZ0NBQXFCLENBQUMsQ0FBQztJQUVqQyxJQUFJLEdBQUcsR0FBRyw2Q0FBNkMsQ0FBQztJQUV4RCxFQUFFLENBQUMsbURBQW1ELEVBQUU7UUFDdEQsa0JBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFakMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFM0Isa0JBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixZQUFZLEVBQUUsQ0FBQztRQUVmLGtCQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBRSxnQ0FBZ0M7UUFFdkUsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25FLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLCtDQUErQyxFQUFFO1FBQ2xELGtCQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRWpDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTNCLGtCQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsWUFBWSxFQUFFLENBQUM7UUFFZixrQkFBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRXBDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRWpDLGdCQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlFLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZlcmlmeU5vQnJvd3NlckVycm9ycywgYnJvd3Nlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3Rlc3RpbmcvZTJlX3V0aWwnO1xuaW1wb3J0IHtleHBlY3R9IGZyb20gJ2FuZ3VsYXIyL3Rlc3RpbmcnO1xuXG5mdW5jdGlvbiB3YWl0Rm9yRWxlbWVudChzZWxlY3Rvcjogc3RyaW5nKSB7XG4gIHZhciBFQyA9ICg8YW55PnByb3RyYWN0b3IpLkV4cGVjdGVkQ29uZGl0aW9ucztcbiAgLy8gV2FpdHMgZm9yIHRoZSBlbGVtZW50IHdpdGggaWQgJ2FiYycgdG8gYmUgcHJlc2VudCBvbiB0aGUgZG9tLlxuICBicm93c2VyLndhaXQoRUMucHJlc2VuY2VPZigkKHNlbGVjdG9yKSksIDIwMDAwKTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvckFsZXJ0KCkge1xuICB2YXIgRUMgPSAoPGFueT5wcm90cmFjdG9yKS5FeHBlY3RlZENvbmRpdGlvbnM7XG4gIGJyb3dzZXIud2FpdChFQy5hbGVydElzUHJlc2VudCgpLCAxMDAwKTtcbn1cblxuZGVzY3JpYmUoJ2NhbiBkZWFjdGl2YXRlIGV4YW1wbGUgYXBwJywgZnVuY3Rpb24oKSB7XG5cbiAgYWZ0ZXJFYWNoKHZlcmlmeU5vQnJvd3NlckVycm9ycyk7XG5cbiAgdmFyIFVSTCA9ICdhbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvY2FuX2RlYWN0aXZhdGUvJztcblxuICBpdCgnc2hvdWxkIG5vdCBuYXZpZ2F0ZSBhd2F5IHdoZW4gcHJvbXB0IGlzIGNhbmNlbGxlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGJyb3dzZXIuZ2V0KFVSTCk7XG4gICAgd2FpdEZvckVsZW1lbnQoJ25vdGUtaW5kZXgtY21wJyk7XG5cbiAgICBlbGVtZW50KGJ5LmNzcygnI25vdGUtMS1saW5rJykpLmNsaWNrKCk7XG4gICAgd2FpdEZvckVsZW1lbnQoJ25vdGUtY21wJyk7XG5cbiAgICBicm93c2VyLm5hdmlnYXRlKCkuYmFjaygpO1xuICAgIHdhaXRGb3JBbGVydCgpO1xuXG4gICAgYnJvd3Nlci5zd2l0Y2hUbygpLmFsZXJ0KCkuZGlzbWlzcygpOyAgLy8gVXNlIHRvIHNpbXVsYXRlIGNhbmNlbCBidXR0b25cblxuICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnbm90ZS1jbXAnKSkuZ2V0VGV4dCgpKS50b0NvbnRhaW4oJ2lkOiAxJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgbmF2aWdhdGUgYXdheSB3aGVuIHByb21wdCBpcyBjb25maXJtZWQnLCBmdW5jdGlvbigpIHtcbiAgICBicm93c2VyLmdldChVUkwpO1xuICAgIHdhaXRGb3JFbGVtZW50KCdub3RlLWluZGV4LWNtcCcpO1xuXG4gICAgZWxlbWVudChieS5jc3MoJyNub3RlLTEtbGluaycpKS5jbGljaygpO1xuICAgIHdhaXRGb3JFbGVtZW50KCdub3RlLWNtcCcpO1xuXG4gICAgYnJvd3Nlci5uYXZpZ2F0ZSgpLmJhY2soKTtcbiAgICB3YWl0Rm9yQWxlcnQoKTtcblxuICAgIGJyb3dzZXIuc3dpdGNoVG8oKS5hbGVydCgpLmFjY2VwdCgpO1xuXG4gICAgd2FpdEZvckVsZW1lbnQoJ25vdGUtaW5kZXgtY21wJyk7XG5cbiAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJ25vdGUtaW5kZXgtY21wJykpLmdldFRleHQoKSkudG9Db250YWluKCdZb3VyIE5vdGVzJyk7XG4gIH0pO1xufSk7XG4iXX0=