// Script to create test fixture images for E2E tests
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create fixtures directory if it doesn't exist
const fixturesDir = path.join(__dirname)
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true })
}

// Create a simple test receipt image (SVG converted to image would be ideal)
// For now, we'll create placeholder files that need to be replaced with actual test images

const testReceiptInfo = `
Test Receipt Images Needed:

1. sample-receipt.jpg - Clear, readable receipt with items and prices
2. blurry-receipt.jpg - Blurry or unreadable receipt for OCR error testing
3. invalid-file.txt - Text file to test invalid file type handling

Sample receipt should contain:
- Restaurant/Store name
- Date
- Multiple items with names and prices
- Tax information
- Total amount

Example content:
===================
    COFFEE SHOP
    2024-01-15
===================
커피               4,500
케이크             8,000
샌드위치           6,500
-----------------
소계             19,000
세금(10%)         1,900
-----------------
총액             20,900
===================

Please replace this file with actual test images before running E2E tests.
`

// Write instructions for test images
fs.writeFileSync(path.join(fixturesDir, 'README.txt'), testReceiptInfo)

// Create a simple invalid text file for testing
fs.writeFileSync(path.join(fixturesDir, 'invalid-file.txt'), 'This is not an image file')

console.log('Test fixtures directory created with instructions.')
console.log('Please add actual test images (sample-receipt.jpg, blurry-receipt.jpg) to tests/fixtures/ directory')