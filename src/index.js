import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';

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
			title={__('Unpublish Schedule', 'unschedule-post')}
			className="unschedule-post-panel"
		>
			<label>{__('Unpublish Date/Time', 'unschedule-post')}</label>
			<input
				type="datetime-local"
				value={date}
				onChange={e => {
					setDate(e.target.value);
					editPost({ meta: { ...meta, [META_KEY]: { ...meta[META_KEY], date: e.target.value, status } } });
				}}
				style={{ width: '100%' }}
			/>
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
		</PluginDocumentSettingPanel>
	);
};

registerPlugin('unschedule-post-panel', {
	render: UnpublishSchedulePanel,
	icon: null,
});
