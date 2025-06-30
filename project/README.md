# YouTube Content Filter Extension

A powerful browser extension that blocks YouTube Shorts and filters unwanted content for a more focused viewing experience.

## Features

### Block YouTube Shorts
- Completely hides YouTube Shorts from all YouTube pages
- Works on homepage, search results, and channel pages
- Removes Shorts shelves and individual Shorts videos
- Hides the Shorts tab from navigation

### Keyword Filtering
- Filter videos by keywords (vlog, comedy, meme, etc.)
- Add/remove keywords through the popup interface
- Real-time filtering as you browse
- Case-insensitive matching

### Statistics Tracking
- Tracks the number of blocked items
- Real-time counter in the extension popup
- Badge notification on the extension icon
- Reset statistics option

### Professional Design
- Clean, modern popup interface
- Smooth animations and transitions
- Toggle switches for easy control
- Responsive design

## Installation

### Chrome/Chromium/Edge/Brave/Firefox
1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your browser toolbar

## Usage

1. **Enable/Disable Shorts Blocking**: Use the toggle in the popup to turn Shorts blocking on/off
2. **Add Keywords**: Enable keyword filtering and add words like "vlog", "meme", "comedy" to filter out unwanted content
3. **View Statistics**: Check how many items have been blocked in the popup
4. **Reset Stats**: Clear the blocked items counter

## Mobile Support

**Browser Extensions**: This extension works on mobile browsers that support extensions:
- Firefox Mobile (Android) - Full support
- Chrome Mobile - Limited extension support
- Edge Mobile - Limited extension support

**YouTube Mobile App**: Unfortunately, browser extensions cannot modify the YouTube mobile app. For mobile app filtering, you would need:
- A rooted/jailbroken device with ad-blocking apps
- DNS-based filtering (limited effectiveness)
- Alternative YouTube apps (not recommended for security reasons)

## Customization

### Adding New Content Filters
You can extend the extension to filter additional content types by modifying `content.js`:

1. Add new selectors to target specific content
2. Create filtering logic for your criteria
3. Update the popup interface to control the new filters

### Modifying Blocked Keywords
The extension comes with keyword filtering that you can customize:
- Common filter terms: "vlog", "comedy", "meme", "reaction", "tiktok", "shorts"
- Add industry-specific terms based on your interests
- Use partial matches (e.g., "unbox" will catch "unboxing")

## Technical Details

### Files Structure
- `manifest.json` - Extension configuration
- `popup.html/css/js` - Extension popup interface
- `content.js` - Main filtering logic
- `content.css` - Styling for hidden content
- `background.js` - Background service worker

### Key Technologies
- Manifest V3 for modern Chrome extensions
- MutationObserver for real-time content detection
- Chrome Storage API for settings persistence
- Content Scripts for YouTube page modification

### Performance
- Lightweight with minimal impact on page load times
- Efficient DOM observation with debounced filtering
- Optimized selectors for fast element detection

## Troubleshooting

### Extension Not Working
1. Refresh the YouTube page after installing
2. Check if the extension is enabled in browser settings
3. Verify permissions are granted for YouTube domains

### Some Shorts Still Showing
1. YouTube frequently updates their HTML structure
2. Report specific cases through the extension feedback
3. The extension will be updated to handle new layouts

### Keyword Filtering Not Working
1. Ensure keyword filtering is enabled in the popup
2. Check that keywords are spelled correctly
3. Remember that matching is case-insensitive

## Privacy & Security

- **No Data Collection**: This extension does not collect or transmit any personal data
- **Local Storage Only**: All settings are stored locally in your browser
- **No Network Requests**: The extension works entirely offline
- **Open Source**: All code is available for review

## Contributing

Feel free to contribute improvements:
1. Fork the repository
2. Make your changes
3. Test thoroughly on different YouTube pages
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Disclaimer

This extension is not affiliated with YouTube or Google. It's an independent tool created to enhance user experience. YouTube may update their website structure, which could temporarily affect the extension's functionality until updates are made.