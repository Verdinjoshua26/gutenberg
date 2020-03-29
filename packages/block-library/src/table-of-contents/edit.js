/**
 * External dependencies
 */
const { isEqual } = require( 'lodash' );

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ListItem from './ListItem';
import {
	convertBlocksToTableOfContents,
	linearToNestedHeadingList,
} from './utils';

export default function TableOfContentsEdit( {
	attributes,
	className,
	setAttributes,
} ) {
	const { headings = [] } = attributes;

	useSelect( ( select ) => {
		const headingBlocks = select( 'core/block-editor' )
			.getBlocks()
			.filter( ( block ) => block.name === 'core/heading' );

		const latestHeadings = convertBlocksToTableOfContents( headingBlocks );

		if ( ! isEqual( headings, latestHeadings ) ) {
			setAttributes( { headings: latestHeadings } );
		}
	} );

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
