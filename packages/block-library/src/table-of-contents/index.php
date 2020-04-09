<?php
/**
 * Server-side rendering of the `core/table-of-contents` block.
 *
 * @package gutenberg
 */

/**
 * Extracts Heading (`core/heading`) blocks from the current post.
 *
 * @return array The list of Heading blocks.
 */
function block_core_table_of_contents_get_heading_blocks() {
	global $post;

	$blocks = parse_blocks( $post->post_content );

	$heading_blocks = array_filter(
		$blocks,
		function ( $block ) {
			return 'core/heading' === $block['blockName'];
		}
	);

	return $heading_blocks;
}

/**
 * Extracts text, anchor and level from a list of heading blocks.
 *
 * @param array $heading_blocks List of Heading blocks.
 *
 * @return array The list of heading parameters.
 */
function block_core_table_of_contents_blocks_to_heading_list( $heading_blocks ) {
	return array_map(
		function ( $heading ) {
			$level           = $heading['attrs']['level'];
			$heading_content = $heading['attrs']['content'];
			$anchor_content  = $heading['attrs']['anchor'];

			// Strip html from heading to use as the table of contents entry.
			$content = $heading_content
				? wp_strip_all_tags( $heading_content, true )
				: '';

			$anchor = $anchor_content ? '#' . $anchor_content : '';

			return array(
				'content' => $content,
				'anchor'  => $anchor,
				'level'   => $level,
			);
		},
		$heading_blocks
	);
}

/**
 * Converts a flat list of heading parameters to a hierarchical nested list
 * based on each header's immediate parent's level.
 *
 * @param array $heading_list Flat list of heading parameters to nest.
 * @param int   $index        The current list index.
 *
 * @return array A hierarchical nested list of heading parameters.
 */
function block_core_table_of_contents_linear_to_nested_heading_list(
	$heading_list,
	$index = 0
) {
	$nested_heading_list = array();

	foreach ( $heading_list as $key => $heading ) {
		if ( ! isset( $heading['content'] ) ) {
			return;
		}

		// Make sure we are only working with the same level as the first
		// iteration in our set.
		if ( $heading['level'] === $heading_list[0]['level'] ) {
			// Check that the next iteration will return a value.
			// If it does and the next level is greater than the current level,
			// the next iteration becomes a child of the current interation.
			if (
				isset( $heading_list[ $key + 1 ] ) &&
				$heading_list[ $key + 1 ]['level'] > $heading['level']
			) {
				// We need to calculate the last index before the next iteration
				// that has the same level (siblings). We then use this last index
				// to slice the array for use in recursion. This prevents duplicate
				// nodes.
				$heading_list_length = count( $heading_list );
				$end_of_slice        = $heading_list_length;
				for ( $i = $key + 1; $i < $heading_list_length; $i++ ) {
					if ( $heading_list[ $i ]['level'] === $heading['level'] ) {
						$end_of_slice = $i;
						break;
					}
				}

				// We found a child node: Push a new node onto the return array
				// with children.
				araray_push(
					$nested_heading_list,
					array(
						'block'    => $heading,
						'index'    => $index + $key,
						'children' => block_core_table_of_contents_linear_to_nested_heading_list(
							array_slice(
								$heading_list,
								$key + 1,
								$end_of_slice - ( $key + 1 )
							),
							$index + $key + 1
						),
					)
				);
			} else {
				// No child node: Push a new node onto the return array.
				array_push(
					$nested_heading_list,
					array(
						'block'    => $heading,
						'index'    => $index + $key,
						'children' => null,
					)
				);
			}
		}
	}

	return $nested_heading_list;
}

/**
 * Renders the heading list of the `core/table-of-contents` block on server.
 *
 * @param array $nested_heading_list Nested list of heading data.
 *
 * @return string The heading list rendered as HTML.
 */
function block_core_table_of_contents_render_list( $nested_heading_list ) {
	$child_nodes = array_map(
		function ( $child_node ) {
			$anchor  = $child_node['block']['anchor'];
			$content = $child_node['block']['content'];

			$entry = $anchor
				? sprintf(
					'<a class="wp-block-table-of-contents__entry" href="%1$s">%2$s</a>',
					esc_attr( $anchor ),
					esc_html( $content )
				)
				: sprintf(
					'<span class="wp-block-table-of-contents__entry">%1$s</span>',
					esc_html( $content )
				);

			return sprintf(
				'<li>%1$s%2$s</li>',
				$entry,
				$child_node['children']
					? block_core_table_of_contents_render_list( $child_node['children'] )
					: null
			);
		},
		$nested_heading_list,
		array_keys( $nested_heading_list )
	);

	return '<ul>' . implode( $child_nodes ) . '</ul>';
}

/**
 * Renders the `core/table-of-contents` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Rendered HTML of this block.
 */
function render_block_core_table_of_contents( $attributes ) {
	// CSS class string.
	$class = 'wp-block-table-of-contents';

	// Add custom CSS classes to class string.
	if ( isset( $attributes['className'] ) ) {
		$class .= ' ' . $attributes['className'];
	}

	$heading_blocks = block_core_table_of_contents_get_heading_blocks();

	if ( count( $heading_blocks ) === 0 ) {
		return '';
	}

	$headings = block_core_table_of_contents_blocks_to_heading_list(
		$heading_blocks
	);

	return sprintf(
		'<nav class="%1$s">%2$s</nav>',
		esc_attr( $class ),
		block_core_table_of_contents_render_list(
			block_core_table_of_contents_linear_to_nested_heading_list( $headings )
		)
	);
}

/**
 * Registers the `core/table-of-contents` block on server.
 *
 * @uses render_block_core_table_of_contents()
 *
 * @throws WP_Error An exception parsing the block definition.
 */
function register_block_core_table_of_contents() {
	register_block_type_from_metadata(
		__DIR__ . '/table-of-contents',
		array(
			'render_callback' => 'render_block_core_table_of_contents',
		)
	);
}
add_action( 'init', 'register_block_core_table_of_contents' );
