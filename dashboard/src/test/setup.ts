import '@testing-library/jest-dom'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserverMock
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function() {}
Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || function() { return false }
Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || function() {}
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || function() {}
