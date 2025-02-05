import '@analogjs/vitest-angular/setup-snapshots'
import '@testing-library/jest-dom/vitest'
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing'
import { getTestBed } from '@angular/core/testing'
import {
  NgModule,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core'

@NgModule({
  providers: [provideExperimentalZonelessChangeDetection()],
})
class TestModule {}

getTestBed().initTestEnvironment(
  [BrowserDynamicTestingModule, TestModule],
  platformBrowserDynamicTesting(),
)
