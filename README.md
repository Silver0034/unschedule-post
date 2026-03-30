# Unschedule Post Plugin

## For Non-Technical Users

### What does this plugin do?

This plugin lets you schedule any post, page, or custom post type to automatically switch to draft or private status at a date and time you choose. Great for promotions, landing pages, or time-limited content!

### How to Install

1. Download or copy the plugin folder to your `wp-content/plugins` directory.
2. In your WordPress admin, go to Plugins > Installed Plugins.
3. Find "Unschedule Post" and click Activate.

### How to Use

1. Edit any post, page, or custom post type.
2. In the post editor, look for the "Unpublish Schedule" panel (in the sidebar or below the editor).
3. Choose a date/time and whether to switch to draft or private.
4. Save or update your post. The post will automatically switch at the scheduled time.

If there is a problem unpublishing, the site admin will receive an email.

---

## For Developers

- The plugin stores unpublish schedule and target status as post meta.
- Uses WordPress cron and timezone for scheduling.
- Only "draft" and "private" are supported in the UI, but you can add more via the `unschedule_post_statuses` filter:

```
add_filter( 'unschedule_post_statuses', function( $statuses, $post ) {
    $statuses['custom_status'] = __( 'Custom Status', 'unschedule-post' );
    return $statuses;
}, 10, 2 );
```

- If unpublishing fails, the admin gets one email per failure.
- If scheduling fails, a WP admin notification is shown (no dedicated admin page).
- UI works in both Gutenberg and Classic editors.

### File Structure

- index.php — Main plugin logic
- .github/copilot-instructions.md — LLM source of truth
- README.md — Human documentation

### Testing

- Test with all post types
- Confirm admin email on failure
- Confirm filter for custom statuses works
- Timezone matches WordPress settings
- WP admin notification appears if scheduling fails
