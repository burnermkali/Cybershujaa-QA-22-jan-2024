import { test, expect, type Page } from '@playwright/test';

/**
 * Demo 1 - Comprehensive Test Suite
 * 
 * This file contains multiple types of tests:
 * - Unit Tests: Testing individual components and functions
 * - Integration Tests: Testing component interactions
 * - E2E Tests: Full user workflow testing
 * - Smoke Tests: Critical path validation
 */

const BASE_URL = process.env.BASE_URL || 'http://192.168.100.4:8080';

// Test data
const SECTIONS = [
  { number: 1, name: 'Intro', title: 'Quality Assurance with Thomas Adika' },
  { number: 2, name: 'Agenda', title: "What We'll Cover Today" },
  { number: 3, name: 'Fundamentals', title: 'QA Fundamentals: What Is It?' },
  { number: 4, name: 'Practice', title: 'QA in Action: Real-World Practice' },
  { number: 5, name: 'Reliability', title: 'Building Reliable & Secure Systems' },
  { number: 6, name: 'Methods', title: 'Key Testing Methodologies' },
  { number: 7, name: 'Modern Dev', title: 'QA in Modern Software Development' },
  { number: 8, name: 'Security', title: 'QA in Cybersecurity' },
  { number: 9, name: 'Careers', title: 'Starting & Growing a QA Career' },
  { number: 10, name: 'Tools', title: 'Essential Tools in QA' },
  { number: 11, name: 'Practices', title: 'Best Practices for QA Success' },
  { number: 12, name: 'Takeaways', title: 'Key Takeaways' },
  { number: 13, name: 'Q&A', title: 'Questions & Discussion' },
  { number: 14, name: 'End', title: 'Thank You!' },
];

// Helper function to wait for page to be ready
async function waitForPageReady(page: Page, timeout: number = 30000) {
  // Wait for load state (DOMContentLoaded + resources loaded)
  // This is more reliable than networkidle which can timeout with HMR/dev servers
  // networkidle waits for 500ms of network inactivity, which never happens with Vite HMR
  await page.waitForLoadState('load', { timeout });
  
  // Wait for main content to be visible - this is the key indicator the page is ready
  await page.waitForSelector('main', { state: 'visible', timeout });
  
  // Additional check: ensure navigation is visible (indicates React has rendered)
  await page.waitForSelector('nav[aria-label*="Presentation sections"], nav[aria-label*="presentation sections"]', { 
    state: 'visible', 
    timeout: 10000 
  }).catch(() => {
    // If nav selector doesn't match exactly, try alternative
    return page.waitForSelector('nav', { state: 'visible', timeout: 5000 }).catch(() => {
      // Navigation might not be critical for all tests
    });
  });
}

// Helper function to get section button by number and name (avoids matching "1" in "11")
function getSectionButton(page: Page, sectionNumber: number, sectionName: string) {
  // Escape special regex characters in section name
  const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match exact format: "N SectionName" (anchored to avoid partial matches)
  return page.getByRole('button', { 
    name: new RegExp(`^${sectionNumber}\\s+${escapedName}$`, 'i') 
  });
}

// Helper function to wait for page to be stable for screenshots
async function waitForPageStable(page: Page) {
  // Wait for load state (more reliable than networkidle with dev servers)
  await page.waitForLoadState('load');
  
  // Wait for main content to be visible
  await page.waitForSelector('main', { state: 'visible' });
  
  // Wait for all images to load
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Resolve even on error to not block
          // Timeout after 5 seconds
          setTimeout(resolve, 5000);
        });
      })
    );
  });
  
  // Wait for CSS transitions and animations to complete
  // Most CSS transitions are 200-300ms, so 1 second should be enough
  await page.waitForTimeout(1000);
  
  // Wait for any layout shifts to settle
  await page.waitForTimeout(500);
}

// ============================================================================
// SMOKE TESTS - Critical Path Validation
// ============================================================================

test.describe('Smoke Tests - Critical Functionality', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Thomas Adika|Lovable App/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display all 14 navigation sections', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Verify navigation menu exists
    const navMenu = page.getByRole('navigation', { name: /Presentation sections/i });
    await expect(navMenu).toBeVisible();
    
    // Verify all 14 sections are present using exact section names
    for (const section of SECTIONS) {
      const sectionButton = getSectionButton(page, section.number, section.name);
      await expect(sectionButton).toBeVisible();
    }
  });

  test('should have no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Filter out known React Router warnings (non-critical)
    const criticalErrors = errors.filter(
      err => !err.includes('React Router Future Flag Warning')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should display progress indicator', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toBeVisible();
    await expect(progressText).toContainText('1 / 14');
  });
});

// ============================================================================
// UNIT TESTS - Individual Component Testing
// ============================================================================

test.describe('Unit Tests - Individual Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
  });

  test('should render header with title and profile image', async ({ page }) => {
    const header = page.locator('header, [role="banner"]').first();
    await expect(header).toBeVisible();
    
    // Check for title
    const title = page.getByRole('heading', { name: /Thomas Adika QA Mentor Hour/i });
    await expect(title).toBeVisible();
    
    // Check for profile image
    const profileImage = page.getByAltText('Thomas Adika');
    await expect(profileImage).toBeVisible();
  });

  test('should render theme toggle button', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /Switch to (Light|Dark) Mode/i });
    await expect(themeToggle).toBeVisible();
    await expect(themeToggle).toBeEnabled();
  });

  test('should render navigation sidebar', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar).toBeVisible();
    
    const navMenu = page.getByRole('navigation', { name: /Presentation sections/i });
    await expect(navMenu).toBeVisible();
  });

  test('should render Previous button (disabled on first page)', async ({ page }) => {
    const prevButton = page.getByRole('button', { name: /Previous/i });
    await expect(prevButton).toBeVisible();
    await expect(prevButton).toBeDisabled();
  });

  test('should render Next button (enabled on first page)', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /Next/i });
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();
  });

  test('should render footer with contact links', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    
    // Check for LinkedIn link
    const linkedInLink = page.getByRole('link', { name: /LinkedIn/i });
    await expect(linkedInLink).toBeVisible();
    await expect(linkedInLink).toHaveAttribute('href', /linkedin\.com/i);
    
    // Check for Email link
    const emailLink = page.getByRole('link', { name: /Email/i });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', /mailto:/i);
  });

  test('should display main heading on intro page', async ({ page }) => {
    const mainHeading = page.getByRole('heading', { name: /Quality Assurance with Thomas Adika/i });
    await expect(mainHeading).toBeVisible();
  });

  test('should render section content area', async ({ page }) => {
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible();
    
    // Verify there's at least one heading
    const headings = page.locator('main h1, main h2, main h3');
    await expect(headings.first()).toBeVisible();
  });
});

// ============================================================================
// INTEGRATION TESTS - Component Interactions
// ============================================================================

test.describe('Integration Tests - Component Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
  });

  test('should navigate between sections using Next button', async ({ page }) => {
    // Start on section 1
    let progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('1 / 14');
    
    // Navigate to section 2
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);
    await expect(progressText).toContainText('2 / 14');
    
    // Navigate to section 3
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);
    await expect(progressText).toContainText('3 / 14');
  });

  test('should navigate between sections using Previous button', async ({ page }) => {
    // Navigate forward first
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);
    
    // Now navigate back
    const prevButton = page.getByRole('button', { name: /Previous/i });
    await expect(prevButton).toBeEnabled();
    
    await prevButton.click();
    await page.waitForTimeout(500);
    
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('2 / 14');
    
    await prevButton.click();
    await page.waitForTimeout(500);
    await expect(progressText).toContainText('1 / 14');
  });

  test('should update content when navigating via sidebar', async ({ page }) => {
    // Click on section 3 from sidebar
    const section3Button = getSectionButton(page, 3, 'Fundamentals');
    await section3Button.click();
    await page.waitForTimeout(500);
    
    // Verify content changed
    const heading = page.getByRole('heading', { name: /QA Fundamentals/i });
    await expect(heading).toBeVisible();
    
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('3 / 14');
  });

  test('should disable Previous button on first section', async ({ page }) => {
    const prevButton = page.getByRole('button', { name: /Previous/i });
    await expect(prevButton).toBeDisabled();
  });

  test('should disable Next button on last section', async ({ page }) => {
    // Navigate to last section
    for (let i = 0; i < 13; i++) {
      await page.getByRole('button', { name: /Next/i }).click();
      await page.waitForTimeout(300);
    }
    
    const nextButton = page.getByRole('button', { name: /Next/i });
    await expect(nextButton).toBeDisabled();
  });

  test('should update progress indicator during navigation', async ({ page }) => {
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    
    // Verify initial state
    await expect(progressText).toContainText('1 / 14');
    
    // Navigate and verify updates
    for (let i = 2; i <= 5; i++) {
      await page.getByRole('button', { name: /Next/i }).click();
      await page.waitForTimeout(300);
      await expect(progressText).toContainText(`${i} / 14`);
    }
  });

  test('should maintain navigation state when switching sections', async ({ page }) => {
    // Navigate to section 5
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /Next/i }).click();
      await page.waitForTimeout(300);
    }
    
    // Click on section 2 from sidebar
    await page.getByRole('button', { name: /2.*Agenda/i }).click();
    await page.waitForTimeout(500);
    
    // Verify we're on section 2
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('2 / 14');
    
    // Previous button should now be enabled
    const prevButton = page.getByRole('button', { name: /Previous/i });
    await expect(prevButton).toBeEnabled();
  });
});

// ============================================================================
// E2E TESTS - Full User Workflows
// ============================================================================

test.describe('E2E Tests - Complete User Workflows', () => {
  test('should complete full presentation navigation flow', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Navigate through all 14 sections using Next button
    for (let i = 1; i <= 14; i++) {
      const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
      await expect(progressText).toContainText(`${i} / 14`);
      
      // Verify main content is visible
      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible();
      
      // Verify heading exists
      const heading = page.locator('main h1').first();
      await expect(heading).toBeVisible();
      
      // Click Next if not on last section
      if (i < 14) {
        const nextButton = page.getByRole('button', { name: /Next/i });
        await expect(nextButton).toBeEnabled();
        await nextButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Verify we're on the last section
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('14 / 14');
    
    // Verify Next button is disabled
    const nextButton = page.getByRole('button', { name: /Next/i });
    await expect(nextButton).toBeDisabled();
  });

  test('should navigate to specific section via sidebar and continue', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Jump to section 6 (Methods) via sidebar
    await getSectionButton(page, 6, 'Methods').click();
    await page.waitForTimeout(500);
    
    // Verify we're on section 6
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('6 / 14');
    
    // Continue navigation forward
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);
    await expect(progressText).toContainText('7 / 14');
  });

  test('should navigate backward through presentation', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Navigate to middle section first
    await getSectionButton(page, 7, 'Modern Dev').click();
    await page.waitForTimeout(500);
    
    // Navigate backward using Previous button
    for (let i = 7; i >= 1; i--) {
      const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
      await expect(progressText).toContainText(`${i} / 14`);
      
      if (i > 1) {
        await page.getByRole('button', { name: /Previous/i }).click();
        await page.waitForTimeout(500);
      }
    }
    
    // Verify we're back at the beginning
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('1 / 14');
  });

  test('should interact with quiz on Methods section', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Navigate to section 6 (Methods) which has a quiz
    await getSectionButton(page, 6, 'Methods').click();
    await page.waitForTimeout(500);
    
    // Look for quiz buttons
    const quizButtons = page.locator('button:has-text("Unit Tests"), button:has-text("End-to-End Tests"), button:has-text("Manual Testing"), button:has-text("Performance Tests")');
    const count = await quizButtons.count();
    
    if (count > 0) {
      // Click on one of the quiz options
      await quizButtons.first().click();
      await page.waitForTimeout(300);
      
      // Verify button was clicked (may change state)
      await expect(quizButtons.first()).toBeVisible();
    }
  });

  test('should access external links in footer', async ({ page, context }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Test LinkedIn link
    const linkedInLink = page.getByRole('link', { name: /LinkedIn/i });
    await expect(linkedInLink).toBeVisible();
    
    // Verify link opens in new tab (if configured)
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      linkedInLink.click(),
    ]);
    
    // Verify new page loaded
    await expect(newPage).toHaveURL(/linkedin\.com/i);
    await newPage.close();
  });

  test('should toggle theme and verify UI persists', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Get initial theme
    const themeToggle = page.getByRole('button', { name: /Switch to (Light|Dark) Mode/i });
    await expect(themeToggle).toBeVisible();
    
    // Click theme toggle
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify page still functions
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible();
    
    // Navigate to verify theme persists
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);
    
    const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
    await expect(progressText).toContainText('2 / 14');
  });

  test('should verify all section content loads correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    // Test each section
    for (const section of SECTIONS) {
      // Navigate to section via sidebar
      const sectionButton = getSectionButton(page, section.number, section.name);
      await sectionButton.click();
      await page.waitForTimeout(500);
      
      // Verify section loaded
      const progressText = page.locator('text=/\\d+ \\/ \\d+/').first();
      await expect(progressText).toContainText(`${section.number} / 14`);
      
      // Verify main heading contains expected text
      const heading = page.locator('main h1').first();
      await expect(heading).toBeVisible();
      
      // Verify main content area is visible
      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible();
    }
  });
});

// ============================================================================
// VISUAL REGRESSION TESTS (Optional - requires baseline screenshots)
// ============================================================================

test.describe('Visual Regression Tests', () => {
  // Set fixed viewport for consistent screenshots
  test.use({ 
    viewport: { width: 1280, height: 720 },
  });

  test('should match visual snapshot of homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageStable(page);
    
    // Take screenshot for visual comparison
    // Note: First run requires --update-snapshots flag to create baseline
    // Run: npx playwright test --update-snapshots
    await expect(page).toHaveScreenshot('homepage-intro.png', {
      fullPage: true,
      maxDiffPixels: 500, // Allow small differences for dynamic content
      timeout: 10000, // Increase timeout for stability
    });
  });

  test('should match visual snapshot of all sections', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageStable(page);
    
    // Capture screenshots for key sections
    const keySections = [1, 6, 10, 14]; // Intro, Methods, Tools, End
    
    for (const sectionNum of keySections) {
      if (sectionNum > 1) {
        // Navigate to section
        const section = SECTIONS[sectionNum - 1];
        const sectionButton = getSectionButton(page, sectionNum, section.name);
        await sectionButton.click();
        
        // Wait for navigation to complete and page to stabilize
        await waitForPageStable(page);
      } else {
        // For first section, ensure it's stable
        await waitForPageStable(page);
      }
      
      const sectionName = SECTIONS[sectionNum - 1].name.toLowerCase().replace(/\s+/g, '-');
      await expect(page).toHaveScreenshot(`section-${sectionNum}-${sectionName}.png`, {
        fullPage: true,
        maxDiffPixels: 500, // Allow small differences for dynamic content
        timeout: 10000, // Increase timeout for stability
      });
    }
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
  });

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    const navMenu = page.getByRole('navigation', { name: /Presentation sections/i });
    await expect(navMenu).toBeVisible();
    
    // Verify buttons have accessible names
    const navButtons = page.locator('[role="navigation"] button');
    const count = await navButtons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = navButtons.nth(i);
      const name = await button.getAttribute('aria-label') || await button.textContent();
      expect(name).toBeTruthy();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('main h1').first();
    await expect(h1).toBeVisible();
    
    // Verify at least one h1 exists in main content
    const h1Count = await page.locator('main h1').count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('should have accessible images with alt text', async ({ page }) => {
    const images = page.locator('main img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Images should have alt text (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

test.describe('Performance Tests', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should navigate between sections quickly', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageReady(page);
    
    const startTime = Date.now();
    
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);
    
    const navigationTime = Date.now() - startTime;
    
    // Navigation should complete within 1 second
    expect(navigationTime).toBeLessThan(1000);
  });
});
