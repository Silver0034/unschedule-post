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
add_action('enqueue_block_editor_assets', function() {
    $asset_file = plugin_dir_path(__FILE__) . 'build/index.js';
    if (file_exists($asset_file)) {
        wp_enqueue_script(
            'unschedule-post-editor',
            plugins_url('build/index.js', __FILE__),
            [ 'wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-i18n' ],
            filemtime($asset_file),
            true
        );
    }
});

// Register meta for all public post types
add_action('init', function() {
    $post_types = get_post_types([ 'public' => true ], 'names');
    foreach ($post_types as $post_type) {
        register_post_meta($post_type, '_unschedule_post_data', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'object',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            },
        ]);
    }
});
