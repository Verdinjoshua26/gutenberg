const ENTRY_CLASS_NAME = 'wp-block-table-of-contents__entry';

export default function TableOfContentsList( {
	nestedHeadingList,
	wrapList = true,
} ) {
	if ( nestedHeadingList ) {
		const childNodes = nestedHeadingList.map( ( childNode, index ) => {
			const { anchor, content } = childNode.heading;

			const entry = anchor ? (
				<a className={ ENTRY_CLASS_NAME } href={ anchor }>
					{ content }
				</a>
			) : (
				<span className={ ENTRY_CLASS_NAME }>{ content }</span>
			);

			return (
				<li key={ index }>
					{ entry }
					{ childNode.children ? (
						<TableOfContentsList
							nestedHeadingList={ childNode.children }
						/>
					) : null }
				</li>
			);
		} );

		// Don't wrap the list elements in a <ul> if converting to a core/list.
		return wrapList ? <ul>{ childNodes }</ul> : childNodes;
	}
}
