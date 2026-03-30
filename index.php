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
