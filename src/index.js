import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import { DateTimePicker, Popover, Button } from '@wordpress/components';
import { PluginPostStatusInfo } from '@wordpress/edit-post';

const META_KEY = '_unschedule_post_data';

const UnpublishStatusRow = () => {
	const meta = useSelect((select) => select('core/editor').getEditedPostAttribute('meta') || {}, []);
	const { editPost } = useDispatch('core/editor');
	const [isPickerOpen, setPickerOpen] = useState(false);
	// Calculate default date: tomorrow at midnight in WP timezone
	const getDefaultDate = () => {
		// Use WP timezone offset if available from window.wpApiSettings
		let tzOffset = 0;
		if (window.wpApiSettings && window.wpApiSettings.timezone_offset) {
			tzOffset = parseInt(window.wpApiSettings.timezone_offset, 10);
		}
		const d = new Date();
		d.setDate(d.getDate() + 1);
		d.setHours(0, 0, 0, 0);
		// Adjust to WP timezone
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset() + tzOffset);
		return d.toISOString().slice(0, 16);
	};

	const safeMeta = meta[META_KEY] && typeof meta[META_KEY] === 'object' ? meta[META_KEY] : {};
	// If no date, null; otherwise, use the value
	const [date, setDate] = useState(safeMeta.date || null);
	const [status, setStatus] = useState(safeMeta.status || 'private');
	const rowRef = useRef();


	useEffect(() => {
		// Debug: log the full meta object and the raw meta key value
		// eslint-disable-next-line no-console
		// eslint-disable-next-line no-console
		const safeMeta = meta[META_KEY] && typeof meta[META_KEY] === 'object' ? meta[META_KEY] : {};
		// Debug: log meta loaded from WP
		// eslint-disable-next-line no-console
		setDate(safeMeta.date || null);
		setStatus(safeMeta.status || 'private');
	}, [meta]);

	// Format for display: show 'None' if no date
	const formatted = date
		? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
		: __('None', 'unschedule-post');

	// Normalize date to WP timezone for saving
	const normalizeToWPTimezone = (isoString) => {
		if (!isoString) return '';
		// If WP timezone offset is available, adjust
		let tzOffset = 0;
		if (window.wpApiSettings && window.wpApiSettings.timezone_offset) {
			tzOffset = parseInt(window.wpApiSettings.timezone_offset, 10);
		}
		const d = new Date(isoString);
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset() + tzOffset);
		return d.toISOString().slice(0, 16);
	};

	const updateMeta = (newDate, newStatus) => {
		// Debug: log meta being saved
		// eslint-disable-next-line no-console
		editPost({ meta: { ...meta, [META_KEY]: { date: newDate, status: newStatus } } });
	};

	return (
		<>
			<div className="editor-post-panel__row-label">{__('Unpublish', 'unschedule-post')}</div>
			<div className="editor-post-panel__row-control" style={{marginLeft: '8px'}}>
				<button
					type="button"
					className="components-button editor-post-schedule__dialog-toggle is-compact is-tertiary"
					style={{ padding: '6px 12px' }}
					onClick={() => setPickerOpen(true)}
					ref={rowRef}
				>
					{formatted}
				</button>
			</div>
			{isPickerOpen && (
				<Popover position="middle right" onClose={() => setPickerOpen(false)} anchorRef={rowRef.current || undefined}>
					<div style={{ padding: 16, minWidth: 320, position: 'relative' }}>
						<Button
							variant="tertiary"
							onClick={() => {
								setDate(null);
								setStatus('private');
								updateMeta('', 'private');
								setPickerOpen(false);
							}}
							style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
						>
							{__('Clear', 'unschedule-post')}
						</Button>
						<DateTimePicker
							currentDate={date || undefined}
							onChange={newDate => {
								// Save in WP timezone
								const normalized = normalizeToWPTimezone(newDate);
								setDate(normalized);
								updateMeta(normalized, status);
							}}
							is12Hour={true}
						/>
						<div style={{ marginTop: 12 }}>
							<label>{__('Target Status', 'unschedule-post')}</label>
							<select
								value={status}
								onChange={e => {
									setStatus(e.target.value);
									updateMeta(date, e.target.value);
								}}
								style={{ width: '100%' }}
							>
								{[
									{ value: '', label: __('— Select —', 'unschedule-post') },
									{ value: 'draft', label: __('Draft', 'unschedule-post') },
									{ value: 'private', label: __('Private', 'unschedule-post') },
								].map(opt => (
									<option key={opt.value} value={opt.value}>{opt.label}</option>
								))}
							</select>
						</div>
					</div>
				</Popover>
			)}
		</>
	);
};

// Only show the row if the post type supports show_in_rest
registerPlugin('unschedule-post-status-row', {
	render: () => (
		<PluginPostStatusInfo>
			<UnpublishStatusRow />
		</PluginPostStatusInfo>
	),
	icon: null,
});
