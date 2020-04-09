/**
 * External dependencies
 */
const { isEqual } = require( 'lodash' );

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ListItem from './list-item';
import {
	convertBlocksToTableOfContents,
	linearToNestedHeadingList,
} from './utils';

export default function TableOfContentsEdit( { className } ) {
	// Local state; not saved to block attributes. The saved block is dynamic and uses PHP to generate its content.
	const [ headings, setHeadings ] = useState( [] );

	const headingBlocks = useSelect( ( select ) => {
		return select( 'core/block-editor' )
			.getBlocks()
			.filter( ( block ) => block.name === 'core/heading' );
	}, [] );

	useEffect( () => {
		const latestHeadings = convertBlocksToTableOfContents( headingBlocks );

		if ( ! isEqual( headings, latestHeadings ) ) {
			setHeadings( latestHeadings );
		}
	}, [ headingBlocks ] );

	if ( headings.length === 0 ) {
		return (
			<p>
				{ __(
					'Start adding Heading blocks to create a table of contents here.'
				) }
			</p>
		);
	}

	return (
		<div className={ className }>
			<ListItem>{ linearToNestedHeadingList( headings ) }</ListItem>
		</div>
	);
}
