# Visual Regression Tests Guide

## Overview

The visual regression tests in `demo1.spec.ts` capture screenshots of your website and compare them against baseline images to detect visual changes.

## First Time Setup

### 1. Generate Baseline Snapshots

On the **first run**, you need to create the baseline screenshots:

```bash
npx playwright test e2e/demo1.spec.ts -g "Visual Regression Tests" --update-snapshots
```

This will:
- Create snapshot files in `e2e/demo1.spec.ts-snapshots/`
- Generate baseline images for all visual tests
- Save screenshots for each browser/platform combination

### 2. Verify Baselines Were Created

Check that snapshot files were created:
```bash
ls -la e2e/demo1.spec.ts-snapshots/
```

You should see files like:
- `homepage-intro-chromium-linux.png`
- `section-1-intro-chromium-linux.png`
- `section-6-methods-chromium-linux.png`
- etc.

## Running Visual Tests

### Normal Test Run (Compare Against Baselines)

```bash
npx playwright test e2e/demo1.spec.ts -g "Visual Regression Tests"
```

This will:
- Take new screenshots
- Compare them against the baseline images
- Report any differences

### Update Baselines (After Intentional UI Changes)

If you've intentionally changed the UI and want to update the baselines:

```bash
npx playwright test e2e/demo1.spec.ts -g "Visual Regression Tests" --update-snapshots
```

## Understanding Test Failures

### Error: "Snapshot doesn't exist"

**Solution**: Run with `--update-snapshots` flag to create the baseline.

### Error: "Pixels are different"

This means the current screenshot differs from the baseline. This could be:
- **Intentional change**: Update the baseline with `--update-snapshots`
- **Unintended change**: Investigate what changed in the UI
- **Flaky test**: Check if animations or dynamic content are causing issues

### Error: "Timeout exceeded" or "Failed to take stable screenshots"

This means the page is still changing when the screenshot is taken. The test includes:
- Fixed viewport size (1280x720)
- Stability checks that wait for:
  - Network to be idle
  - Images to load
  - CSS animations to complete
  - Layout to stabilize

If this still fails, you may need to:
1. Increase the timeout in the test
2. Add additional waits for specific elements
3. Check for dynamic content that changes on each load

## Test Configuration

The visual tests use:
- **Fixed viewport**: 1280x720 pixels (consistent across runs)
- **Full page screenshots**: Captures entire page, not just viewport
- **Max diff pixels**: 500 (allows minor differences)
- **Timeout**: 10 seconds (gives time for page to stabilize)

## Best Practices

1. **Commit baselines to version control**: This allows team members to compare against the same baselines
2. **Review diffs carefully**: When tests fail, review the diff images to understand what changed
3. **Update baselines intentionally**: Only update baselines when UI changes are intentional
4. **Run on CI/CD**: Include visual regression tests in your CI pipeline
5. **Test across browsers**: Visual differences can occur between Chromium, Firefox, and WebKit

## Troubleshooting

### Screenshots are unstable

If screenshots keep changing slightly:
- Check for animations or transitions
- Look for dynamic content (timestamps, random data)
- Verify viewport size is consistent
- Check for fonts loading asynchronously

### Different results on different machines

Visual tests can vary by:
- Operating system (Linux vs Windows vs Mac)
- Browser version
- Font rendering differences
- Display scaling

Consider:
- Running tests in CI/CD for consistency
- Using Docker containers for consistent environments
- Setting up separate baselines per platform if needed

## Files Generated

- **Baseline snapshots**: `e2e/demo1.spec.ts-snapshots/*.png`
- **Test results**: `test-results/` (on failure, contains diff images)
- **HTML report**: `playwright-report/index.html` (shows visual diffs)

## Example Workflow

```bash
# 1. First time - create baselines
npx playwright test e2e/demo1.spec.ts -g "Visual Regression Tests" --update-snapshots

# 2. Make UI changes to your website

# 3. Run tests to see if anything changed
npx playwright test e2e/demo1.spec.ts -g "Visual Regression Tests"

# 4. If changes are intentional, update baselines
npx playwright test e2e/demo1.spec.ts -g "Visual Regression Tests" --update-snapshots

# 5. Commit updated baselines
git add e2e/demo1.spec.ts-snapshots/
git commit -m "Update visual regression baselines"
```

## Skipping Visual Tests

If you need to skip visual tests temporarily:

```bash
# Skip only visual tests
npx playwright test e2e/demo1.spec.ts --grep-invert "Visual Regression"
```

Or comment out the test.describe block in the spec file.
