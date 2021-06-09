import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { testMock } from './test/testMock';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('testCase', () => {
    for (let test of testMock) {
      component.idToStart = test.idInput;
      component.jsonInput = test.jsonInput;
      component.objToFindInput = test.objInput;
      expect(component.generateOutput()).toEqual(test.result);
    }
  });
});
