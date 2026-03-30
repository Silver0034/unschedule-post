<?php

/**
 * Plugin Name: Unschedule Post
 * Description: Schedule any post type to automatically switch to draft or private at a specified date/time. Extensible via filter. Notifies admin on failure.
 * Version: 1.0.0
 * Author: Jacob Lodes
 * Text Domain: unschedule-post
 */

namespace UnschedulePost;

if (! defined('ABSPATH')) exit;

// Enqueue block editor assets for Gutenberg sidebar
add_action('enqueue_block_editor_assets', function () {
    $asset_file = plugin_dir_path(__FILE__) . 'build/index.js';
    if (file_exists($asset_file)) {
        wp_enqueue_script(
            'unschedule-post-editor',
            plugins_url('build/index.js', __FILE__),
            ['wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-i18n'],
            filemtime($asset_file),
            true
        );
    }
});

// Register meta for all public post types
add_action('init', function () {
    $post_types = get_post_types(['public' => true], 'names');
    foreach ($post_types as $post_type) {
        register_post_meta($post_type, '_unschedule_post_data', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'object',
            'auth_callback' => function () {
                return current_user_can('edit_posts');
            },
        ]);
    }
});

// Listen for meta changes and schedule/unschedule cron
add_action('updated_post_meta', function ($meta_id, $post_id, $meta_key, $meta_value) {
    if ($meta_key !== '_unschedule_post_data') return;
    unschedule_post_unschedule_event($post_id);
    if (is_array($meta_value) && !empty($meta_value['date']) && !empty($meta_value['status'])) {
        $timestamp = unschedule_post_parse_datetime($meta_value['date']);
        if ($timestamp && $timestamp > time()) {
            wp_schedule_single_event($timestamp, 'unschedule_post_cron_event', [$post_id, $meta_value['status']]);
        } else if ($timestamp) {
            $GLOBALS['unschedule_post_admin_notice'] = __('Unpublish schedule time is in the past or invalid.', 'unschedule-post');
        }
    }
}, 10, 4);

// Unschedule on meta deletion
add_action('deleted_post_meta', function ($meta_id, $post_id, $meta_key, $_meta_value) {
    if ($meta_key === '_unschedule_post_data') {
        unschedule_post_unschedule_event($post_id);
    }
}, 10, 4);

// Cron event handler
add_action('unschedule_post_cron_event', function ($post_id, $status) {
    $post = get_post($post_id);
    if (!$post) return;
    $statuses = apply_filters('unschedule_post_statuses', [
        'draft' => __('Draft', 'unschedule-post'),
        'private' => __('Private', 'unschedule-post'),
    ], $post);
    if (!isset($statuses[$status])) return;
    $result = wp_update_post([
        'ID' => $post_id,
        'post_status' => $status,
    ], true);
    if (is_wp_error($result)) {
        unschedule_post_notify_admin_failure($post, $status, $result->get_error_message());
    } else {
        delete_post_meta($post_id, '_unschedule_post_data');
    }
}, 10, 2);

// Helper: Unschedule any existing cron event for this post
function unschedule_post_unschedule_event($post_id)
{
    $crons = _get_cron_array();
    if (!$crons) return;
    foreach ($crons as $timestamp => $cron) {
        if (isset($cron['unschedule_post_cron_event'])) {
            foreach ($cron['unschedule_post_cron_event'] as $args) {
                if (isset($args['args'][0]) && $args['args'][0] == $post_id) {
                    wp_unschedule_event($timestamp, 'unschedule_post_cron_event', $args['args']);
                }
            }
        }
    }
}

// Helper: Parse datetime string in WP timezone
function unschedule_post_parse_datetime($datetime)
{
    if (empty($datetime)) return false;
    $timezone = wp_timezone();
    try {
        $dt = new DateTimeImmutable($datetime, $timezone);
        return $dt->getTimestamp();
    } catch (Exception $e) {
        return false;
    }
}

// Helper: Notify admin on failure
function unschedule_post_notify_admin_failure($post, $status, $error)
{
    $admin_email = get_option('admin_email');
    $subject = sprintf(__('Failed to unpublish post ID %d', 'unschedule-post'), $post->ID);
    $message = sprintf(__("The post '%s' (ID %d) could not be switched to status '%s'. Error: %s", 'unschedule-post'), $post->post_title, $post->ID, $status, $error);
    wp_mail($admin_email, $subject, $message);
}

// Show admin notice if scheduling fails (invalid/past date)
add_action('admin_notices', function () {
    if (!empty($GLOBALS['unschedule_post_admin_notice'])) {
        echo '<div class="notice notice-error"><p>' . esc_html($GLOBALS['unschedule_post_admin_notice']) . '</p></div>';
    }
});
