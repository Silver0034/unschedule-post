import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { DateTimePicker } from '@wordpress/components';

const META_KEY = '_unschedule_post_data';

const UnpublishSchedulePanel = () => {
	const meta = useSelect((select) => select('core/editor').getEditedPostAttribute('meta') || {}, []);
	const { editPost } = useDispatch('core/editor');

	const [date, setDate] = useState(meta[META_KEY]?.date || '');
	const [status, setStatus] = useState(meta[META_KEY]?.status || '');

	useEffect(() => {
		setDate(meta[META_KEY]?.date || '');
		setStatus(meta[META_KEY]?.status || '');
	}, [meta]);

	const statuses = [
		{ value: '', label: __('— Select —', 'unschedule-post') },
		{ value: 'draft', label: __('Draft', 'unschedule-post') },
		{ value: 'private', label: __('Private', 'unschedule-post') },
	];

	return (
		<PluginDocumentSettingPanel
			name="unschedule-post-panel"
			title={__('Unpublish', 'unschedule-post')}
			className="unschedule-post-panel"
		>
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
					{statuses.map(opt => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
			</div>
		</PluginDocumentSettingPanel>
	);
};

registerPlugin('unschedule-post-panel', {
	render: UnpublishSchedulePanel,
	icon: null,
});
