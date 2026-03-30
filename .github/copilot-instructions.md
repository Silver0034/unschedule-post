# Copilot Instructions: unschedule-post Plugin

## Purpose

This plugin allows scheduling any post type in WordPress to automatically switch to draft or private status at a specified date/time, using WordPress's timezone and cron. It is extensible via a filter for custom statuses, and notifies the admin by email if unpublishing fails.

## Key Features

- UI in post editor for scheduling unpublish (draft/private only)
- Works for all post types (including custom)
- Uses WordPress timezone and cron
- One admin email per unpublish failure
- Extensible via `apply_filters( 'unschedule_post_statuses', $statuses, $post )`
- Admin notification if scheduling fails (no dedicated admin page)

## File Structure

- index.php — Main plugin logic, hooks, cron handler, filter, email, admin notifications
- package.json, webpack.config.js — Build setup
- .gitignore
- .github/copilot-instructions.md — LLM source of truth
- README.md — Human documentation

## Implementation Notes

- Store unpublish schedule/status as post meta for all post types
- On post save, schedule a cron event using the WordPress timezone
- On post update/delete, reschedule or unschedule as needed
- Cron handler switches post to draft/private (or custom via filter)
- If status change fails, send one email per failure to the admin
- If scheduling fails, show a WP admin notification
- UI must work in both Gutenberg and Classic editors

## Extensibility

Developers can add custom statuses by hooking into the `unschedule_post_statuses` filter. Example:

add_filter( 'unschedule_post_statuses', function( $statuses, $post ) {
$statuses['custom_status'] = \_\_( 'Custom Status', 'unschedule-post' );
return $statuses;
}, 10, 2 );

## Testing

- Test with posts, pages, and custom post types
- Confirm admin email on failure
- Confirm filter for custom statuses works
- Timezone matches WordPress settings
- WP admin notification appears if scheduling fails

## Do Not

- Do not add a dedicated admin page/feed
- Do not support statuses other than draft/private in UI (use filter for more)

## Update This File

Keep this file up to date with all technical and architectural decisions. This is the source of truth for LLMs working on this plugin.
