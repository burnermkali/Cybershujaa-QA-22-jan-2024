# Demo 1 Test Suite Documentation

## Overview

The `demo1.spec.ts` file contains a comprehensive test suite for the QA Mentor Hub presentation website. It includes multiple types of tests following industry best practices.

## Test Types Included

### 1. **Smoke Tests** 🔥
**Purpose**: Quick validation of critical functionality to ensure the application is stable enough for further testing.

**What they test**:
- Homepage loads successfully
- All 14 navigation sections are present
- No critical console errors
- Progress indicator displays correctly

**When to run**: Before every deployment, in CI/CD pipeline as a gate

**Example**:
```typescript
test('should load homepage successfully', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Thomas Adika/);
});
```

---

### 2. **Unit Tests** 🧪
**Purpose**: Test individual components and functions in isolation.

**What they test**:
- Header component renders correctly
- Theme toggle button exists and is functional
- Navigation sidebar displays properly
- Previous/Next buttons render with correct states
- Footer links are present
- Individual UI components work independently

**When to run**: During development, after component changes

**Example**:
```typescript
test('should render theme toggle button', async ({ page }) => {
  const themeToggle = page.getByRole('button', { name: /Switch to (Light|Dark) Mode/i });
  await expect(themeToggle).toBeVisible();
});
```

---

### 3. **Integration Tests** 🔗
**Purpose**: Test how multiple components work together.

**What they test**:
- Navigation between sections using Next/Previous buttons
- Sidebar navigation updates content correctly
- Progress indicator updates during navigation
- Button states (enabled/disabled) change correctly
- Navigation state persists when switching sections

**When to run**: After integrating components, before E2E tests

**Example**:
```typescript
test('should navigate between sections using Next button', async ({ page }) => {
  await page.getByRole('button', { name: /Next/i }).click();
  await expect(progressText).toContainText('2 / 14');
});
```

---

### 4. **E2E (End-to-End) Tests** 🌐
**Purpose**: Test complete user workflows from start to finish.

**What they test**:
- Complete presentation navigation flow (all 14 sections)
- Jumping to specific sections and continuing
- Backward navigation through entire presentation
- Quiz interaction on Methods section
- External link functionality
- Theme toggle with navigation persistence
- All section content loads correctly

**When to run**: Before releases, in staging environment

**Example**:
```typescript
test('should complete full presentation navigation flow', async ({ page }) => {
  // Navigate through all 14 sections
  for (let i = 1; i <= 14; i++) {
    await expect(progressText).toContainText(`${i} / 14`);
    if (i < 14) {
      await page.getByRole('button', { name: /Next/i }).click();
    }
  }
});
```

---

### 5. **Visual Regression Tests** 📸
**Purpose**: Detect unintended visual changes in the UI.

**What they test**:
- Homepage visual appearance
- Key sections visual appearance (Intro, Methods, Tools, End)
- Screenshot comparison against baseline

**When to run**: Before releases, after UI changes

**Note**: First run creates baseline screenshots. Subsequent runs compare against baseline.

**Example**:
```typescript
test('should match visual snapshot of homepage', async ({ page }) => {
  await expect(page).toHaveScreenshot('homepage-intro.png', {
    fullPage: true,
    maxDiffPixels: 100,
  });
});
```

---

### 6. **Accessibility Tests** ♿
**Purpose**: Ensure the application is accessible to users with disabilities.

**What they test**:
- Proper ARIA labels on navigation elements
- Correct heading hierarchy (h1, h2, etc.)
- Images have appropriate alt text
- Keyboard navigation works

**When to run**: Before releases, for compliance

**Example**:
```typescript
test('should have proper ARIA labels on navigation', async ({ page }) => {
  const navMenu = page.getByRole('navigation', { name: /Presentation sections/i });
  await expect(navMenu).toBeVisible();
});
```

---

### 7. **Performance Tests** ⚡
**Purpose**: Ensure the application meets performance requirements.

**What they test**:
- Page load time (should be < 5 seconds)
- Navigation speed (should be < 1 second)

**When to run**: Periodically, after major changes

**Example**:
```typescript
test('should load page within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto(BASE_URL);
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(5000);
});
```

---

## Running the Tests

### Run all tests:
```bash
npx playwright test e2e/demo1.spec.ts
```

### Run specific test type:
```bash
# Smoke tests only
npx playwright test e2e/demo1.spec.ts -g "Smoke Tests"

# Unit tests only
npx playwright test e2e/demo1.spec.ts -g "Unit Tests"

# E2E tests only
npx playwright test e2e/demo1.spec.ts -g "E2E Tests"
```

### Run in headed mode (see browser):
```bash
npx playwright test e2e/demo1.spec.ts --headed
```

### Run with UI mode:
```bash
npx playwright test e2e/demo1.spec.ts --ui
```

### Run specific test:
```bash
npx playwright test e2e/demo1.spec.ts -g "should load homepage successfully"
```

### Generate HTML report:
```bash
npx playwright test e2e/demo1.spec.ts
# Report will be in playwright-report/index.html
```

---

## Test Data

The test suite uses a `SECTIONS` array containing all 14 sections:
- Section numbers (1-14)
- Section names (Intro, Agenda, Fundamentals, etc.)
- Expected titles for each section

---

## Best Practices Used

1. **Role-based locators**: Using `getByRole()` instead of fragile CSS selectors
2. **Auto-retrying assertions**: Playwright automatically retries assertions
3. **Descriptive test names**: Clear, readable test descriptions
4. **Helper functions**: `waitForPageReady()` for consistent page loading
5. **Test organization**: Tests grouped by type using `test.describe()`
6. **Setup/Teardown**: `beforeEach` hooks for consistent test setup
7. **Timeout handling**: Appropriate waits for async operations

---

## Maintenance

### Adding New Tests

1. **Identify test type**: Determine if it's unit, integration, E2E, etc.
2. **Add to appropriate describe block**: Place in the correct test suite
3. **Use role-based locators**: Prefer `getByRole()` over CSS selectors
4. **Add descriptive name**: Clear test description
5. **Verify it runs**: Test locally before committing

### Updating Tests

- Update section data in `SECTIONS` array if sections change
- Update expected titles if content changes
- Adjust timeouts if page load times change
- Update visual baselines when UI intentionally changes

---

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Smoke Tests
  run: npx playwright test e2e/demo1.spec.ts -g "Smoke Tests"

- name: Run Full Test Suite
  run: npx playwright test e2e/demo1.spec.ts
```

---

## Troubleshooting

### Tests failing due to timing?
- Increase `waitForTimeout` values
- Use `waitForLoadState('load')` for page loads (NOT 'networkidle' - it times out with dev servers/HMR)
- Wait for specific selectors that indicate page readiness (e.g., `main`, `nav`)

### Visual regression tests failing?
- Review the diff in `test-results/`
- Update baseline if change is intentional: `npx playwright test --update-snapshots`

### Flaky tests?
- Ensure proper waits are in place
- Use `waitForLoadState('load')` instead of `networkidle` (which can timeout with Vite HMR)
- Wait for specific elements rather than network idle state
- Check for race conditions
- Use `waitForSelector()` with appropriate timeouts

---

## References

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Types Guide](https://playwright.dev/docs/test-types)
