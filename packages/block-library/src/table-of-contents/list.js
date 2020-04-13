export default function List( { children, noWrapList = false } ) {
	if ( children ) {
		const childNodes = children.map( ( childNode, index ) => {
			const { anchor, content } = childNode.block;

			const itemClassName = 'wp-block-table-of-contents__entry';

			const entry = anchor ? (
				<a className={ itemClassName } href={ `#${ anchor }` }>
					{ content }
				</a>
			) : (
				<span className={ itemClassName }>{ content }</span>
			);

			return (
				<li key={ index }>
					{ entry }
					{ childNode.children ? (
						<List>{ childNode.children }</List>
					) : null }
				</li>
			);
		} );

		// Don't wrap the list elements in <ul> if converting to a core/list.
		return noWrapList ? childNodes : <ul>{ childNodes }</ul>;
	}
}
