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
	const [date, setDate] = useState(meta[META_KEY]?.date || '');
	const [status, setStatus] = useState(meta[META_KEY]?.status || '');
	const rowRef = useRef();

	useEffect(() => {
		setDate(meta[META_KEY]?.date || '');
		setStatus(meta[META_KEY]?.status || '');
	}, [meta]);

	const formatted = date
		? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
		: __('[not scheduled]', 'unschedule-post');

	return (
		<>
			<div
				ref={rowRef}
				className="edit-post-post-schedule__row"
				style={{ cursor: 'pointer', padding: '8px 0' }}
				onClick={() => setPickerOpen(true)}
			>
				<span className="edit-post-post-schedule__label">{__('Unpublish', 'unschedule-post')}</span>
				<span className="edit-post-post-schedule__value">
					<Button variant="link" style={{ padding: 0 }}>{formatted}</Button>
				</span>
			</div>
			{isPickerOpen && (
				<Popover position="middle right" onClose={() => setPickerOpen(false)} anchorRef={rowRef}>
					<div style={{ padding: 16, minWidth: 320 }}>
						<DateTimePicker
							currentDate={date || undefined}
							onChange={newDate => {
								setDate(newDate);
								editPost({ meta: { ...meta, [META_KEY]: { ...meta[META_KEY], date: newDate, status } } });
							}}
							is12Hour={false}
						/>
						<div style={{ marginTop: 12 }}>
							<label>{__('Target Status', 'unschedule-post')}</label>
							<select
								value={status}
								onChange={e => {
									setStatus(e.target.value);
									editPost({ meta: { ...meta, [META_KEY]: { ...meta[META_KEY], date, status: e.target.value } } });
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

// Register the row in the post status area
registerPlugin('unschedule-post-status-row', {
	render: () => (
		<PluginPostStatusInfo>
			<UnpublishStatusRow />
		</PluginPostStatusInfo>
	),
	icon: null,
});
