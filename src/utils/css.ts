/**
 * CSS utility functions for DOM manipulation and style retrieval
 */

/**
 * Retrieves the value of a CSS property from a given element
 *
 * @param {HTMLElement} element - Element to retrieve the CSS property from
 * @param {string} property - Property name to retrieve the value from
 * @returns {string} the value of the given CSS property
 */
export function getCssVariable(
  element: HTMLElement,
  property: string
): string {
  const styles = getComputedStyle(element);

  return styles.getPropertyValue(property);
}

/**
 * Retrieves the value of a CSS custom property from the document root
 *
 * @param {string} property - CSS custom property name (e.g., '--color-primary')
 * @returns {string} the value of the CSS custom property, trimmed
 */
export function getRootCssVariable(property: string): string {
  return getCssVariable(document.documentElement, property).trim();
}
