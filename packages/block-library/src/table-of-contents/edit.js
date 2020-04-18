/**
 * External dependencies
 */
import { isEqual } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	__experimentalBlock as Block,
	BlockIcon,
} from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import List from './list';
import { convertBlocksToHeadingList, linearToNestedHeadingList } from './utils';

export default function TableOfContentsEdit( { className } ) {
	// Local state; not saved to block attributes. The saved block is dynamic and uses PHP to generate its content.
	const [ headings, setHeadings ] = useState( [] );

	const headingBlocks = useSelect( ( select ) => {
		return select( 'core/block-editor' )
			.getBlocks()
			.filter( ( block ) => block.name === 'core/heading' );
	}, [] );

	useEffect( () => {
		const latestHeadings = convertBlocksToHeadingList( headingBlocks );

		if ( ! isEqual( headings, latestHeadings ) ) {
			setHeadings( latestHeadings );
		}
	}, [ headingBlocks ] );

	// If there are no headings or the only heading is empty.
	if ( headings.length === 0 || headings[ 0 ].content === '' ) {
		return (
			<Block.div>
				<Placeholder
					className="wp-block-table-of-contents"
					icon={ <BlockIcon icon="list-view" /> }
					label="Table of Contents"
					instructions={ __(
						'Start adding Heading blocks to create a table of contents. Headings with HTML anchors will be linked here.'
					) }
				/>
			</Block.div>
		);
	}

	return (
		<Block.nav className={ className }>
			<List>{ linearToNestedHeadingList( headings ) }</List>
		</Block.nav>
	);
}
