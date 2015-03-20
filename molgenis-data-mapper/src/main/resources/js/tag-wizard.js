/**
 * Tag wizard
 * 
 * @param $
 * @param molgenis
 */
(function($, molgenis) {
	"use strict";

	var relationAndTagTemplate;

	function createSelect2() {
		
		$('#test').select2({
			width: 500,
			minimumInputLength: 1,
			multiple: true,
			closeOnSelect: true,
			query: function(options) {
				$.ajax({
					url: 'getontologyterms?search=' + options.term + '&ontologyIds=AAAACTBSIXVJ7OHIKZFAZXQAAE',
					success: function(data){
						options.callback({results : data, more : false});
					}
				});
			},
			formatSelection: function(term) {
				return term.label;
			},
			formatResult: function(term) {
				return term.label;
			},
			id: function(term) {
				return term.IRI;
			}
		});
	}
	
	/**
	 * Function that loads the expression and tag information.
	 */
	function loadRelationAndTagContainer(relation, tags) {
		var relationAndTagInfoContainer = $('#relation-and-tag-info-container');

		relationAndTagInfoContainer.empty();
		relationAndTagTemplate = Handlebars.compile($("#relation-and-tag-template").html());

		relationAndTagInfoContainer.append(relationAndTagTemplate({
			'relation' : relation,
			'taglist' : tags
		}));

		$('#tag-dropdown').select2();
	}

	$(function() {
		$('#ontology-select').select2();
		
		$('.add-tag-btn').on('click', function() {
			var attributeName = $(this).val();
			$(this).closest('table');
			
//			var $tbody = $('#'+attributeName) 
//			//var table = document.getElementById(attributeName).getElementsByTagName('tbody')[0];
//			var selectId = $(this).val() + "-row-" + table.rows.length;
//			
//			var newRow = table.insertRow(table.rows.length);
//			var newRelation = newRow.insertCell(0);
//			var newTags = newRow.insertCell(1);
//			
//			var newRelationContent = document.createTextNode('not speficied..');
//			var input = document.createElement('input');
//			input.type = 'hidden';
//			input.id = selectId;
//			
//			newRelation.appendChild(newRelationContent);
//			newTags.appendChild(input);
//			
//			createSelect2(selectId);
//			
		});
		
		$('.remove-tag-btn').on('click', function() {
			var relation = $(this).parent().prev().children().val();
			var tags = [];

			$.each($(this).parent().children(), function() {
				tags.push($(this).text());
			});

			tags.splice(tags.indexOf($(this).text()), 1);
			$(this).remove();

			loadRelationAndTagContainer(relation, tags);
		});

		$('.add-new-tags-btn').on('click', function() {
			var relation = $(this).closest('tr').find("td:first").data('relation');
			loadRelationAndTagContainer(relation, null);
		});
	});
}($, window.top.molgenis = window.top.molgenis || {}));