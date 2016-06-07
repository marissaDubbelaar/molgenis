/*
 * Code written in this javascript document is used to perform global features of GOAD.
 * @Author Mldubbelaar
 */

var uniqueStudies = []
var uniqueTitle = []
var uniqueGEOD = []
var organismOnPage = []
var GEODOnPage = []
var bargraphData = []

$(document).ready(function () {

	obtainStudies();	
	
	// The code below is used to connect the GOAD Facebook page to the website.
	if ($('#fb-root').length > 0) {
        $(function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
                return;
            js = d.createElement(s);
            js.id = id;
            // Connecting to the appID that links to the GOAD facebook page
            js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.3&appId=654692364667032";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }  
	
	// When the user clicks upon the contact button, all other divs are hidden and contactInfo is shown.
	$("body").on("click", "#contactButton", function(){
		returnHome();
		$("#accordion").hide();
		$("#contactInfo").show();
	});

	// When clicking upon the return button at the publication part, the homepage is shown again. 
	$("body").on("click", ".returnButton", function(){
		returnHome();
	});
	
	$("body").on("click", "#informationButton", function(){
		returnHome();
		$("#accordion").hide();
		$("#materialInfo").show();
	});
	
	$("body").on("click", "#geneSearch", function(){
		var geneName = [];
		var freqData = [];
		var allInfoFreqData = {};
		var tpmFreqData = {};
		// The filled in value of the input with id geneText is used.
		if ($('#geneText').val() != "") {
			$.each(uniqueGEOD, function(s, studies){
				// The first step is to determine which organism is checked.
				// The information of that organism is used to look up the gene and the link to the ensembl page.
				// An error bar is shown when the gene couldn't be found.
				
				// Checking for the organism 'mice'
				if ($("input[type='radio']:checked").val() === "mice") {
					geneName = capitalizeEachWord($('#geneText').val());
					$.get("/api/v2/miceGenes?q=Associated_Gene_Name=="+geneName).done(function(data){
						if (data["total"] !== 0) {
							var data = data["items"];
							$("#geneInformation").html("<a href='http://www.ensembl.org/Mus_musculus/Gene/Summary?g="+data[0]['Ensembl_Gene_ID']+"' target='_blank'><h4>"+ geneName + "</a>" +
								"<br/>" + capitalizeEachWord(data[0]["Description"].split("[")[0]) + "</h4>");
						} else {
							$("#geneInformation").html('<div class="alert alert-danger" role="alert"><strong>Oops!</strong> The gene: "'+ capitalizeEachWord(geneName) +'" is unknown<br/>Please return and fill in another gene!</div>');
						}
					});
					
				// Checking for the organism 'human'
				} else if ($("input[type='radio']:checked").val() === "human") {
					geneName = $('#geneText').val().toUpperCase();
					$.get("/api/v2/humanGenes?q=Associated_Gene_Name=="+geneName).done(function(data){
						if (data["total"] !== 0) {
							var data = data["items"];
							$("#geneInformation").html("<a href='http://www.ensembl.org/Home_sapiens/Gene/Summary?g="+data[0]['Ensembl_Gene_ID']+"' target='_blank'><h4>"+ geneName + "</a>" +
								"<br/><h5>" + capitalizeEachWord(data[0]["Description"].split("[")[0]) + "</h4>");
						} else {
							$("#geneInformation").html('<div class="alert alert-danger" role="alert"><strong>Oops!</strong> The gene: "'+ capitalizeEachWord(geneName) +'" is unknown<br/>Please return and fill in another gene!</div>');
						}
					});
				}
				
				//The given gene is searched within all of the studies.
				$.get("/api/v2/TPM_"+studies.replace(/-/g,"")+"?q=external_gene_name=="+geneName).done(function(data){
					// The process continues when information is found.)
					if (data["total"] !== 0) {
					// The div with id dashboard is shown (necessary otherwise the image wont be created).
					$("#dashboard").show();
						// Attributes are obtained from the meta data
						// Items are obtained.
						var attr = data.meta["attributes"];
						var data = data["items"];
						
						//Each data item and attribute is walked through.
						$.each(data, function(i, content){
							$.each(attr, function(t, types){
								// The 1st position when performing item % 4 and is used to obtain the cell type name.
								if (t % 4 === 1 && t !== 0) {
									if (attr[t]["name"].length > 4){
										// The names of the cell types are capitalized when the length > 4.
										allInfoFreqData["Gene"] = capitalizeEachWord(attr[t]["name"].replace(/_/g, " "))
									} else {
										// Cell types with a length of 4 are seen as an abbreviation and therefore written in Uppercase.
										allInfoFreqData["Gene"] = attr[t]["name"].replace(/_/g, " ").toUpperCase()
									}
									// The 'normal' TPM values are obtained as well
									tpmFreqData["TPM"] = data[i][attr[t]["name"]]
								} else if (t % 4 === 2 && t !== 0) {
									// The TPM low values are obtained
									// Found on the 2th position when performing item % 4.
									tpmFreqData["TPM Low"] = data[i][attr[t]["name"]]
								} else if (t % 4 === 3 && t !== 0) {
									// Found on the 3th position when performing item % 4.
									tpmFreqData["TPM High"] = data[i][attr[t]["name"]]
									// All of the obtained info about the cell type is saved into allInfoFreqData
									allInfoFreqData["TPMvals"] = tpmFreqData
									// The dict tpmFreqData is cleared for the next cell type (only TPM values)
									tpmFreqData = {};
									// The dict allInfoFreData is pushed into the dict freData so it can be used by the
									// function dashboard in the end.
									freqData.push(allInfoFreqData);
									// The dict allInfoFreqData is cleared when all of the celltypes within a study are walked through.
									if (t !== attr.length) {
										allInfoFreqData = {};
									}	 
								}
							});
						});
						
						// A div is created for each study (Making sure that the page doesn't look messed up in the end).
						$("#dashboard").append("<div id='" + studies.replace(/-/g,"") + "'>")
						// The title, author and research link are obtained from the global study information.
						$.get('/api/v2/Test_studies?attr=Title&q=GEOD_NR=="'+studies+'"').done(function(data){
								var data = data["items"];
								// This information is added into the div, making sure that it is clear which dashboard belongs to which study.
								if (data[1]['Research_link'] === "Unknown") {
									
									$("#"+studies.replace(/-/g,"")).append("<p class='svgTitle'><b>"+ data[1]["Title"] +"</b><br/>By "+ data[1]["Author"] + "</a>"+ "</p> <br/>");
								} else {
									$("#"+studies.replace(/-/g,"")).append("<p class='svgTitle'><b>"+ data[1]["Title"] +"</b><br/>By <a href='"+data[1]['Research_link']+"' target='_blank'>"+ data[1]["Author"] + "</a>"+ "</p> <br/>");
								}
								// This information is added into the div, making sure that it is clear which doashboard belongs to which study.
							});
						// The dashboard is created for the study.
						dashboard('#'+studies.replace(/-/g,""),freqData);
						// freqData is cleared.
						freqData = [];
					} 
				});
			});
		}

	// The accordion is resetted to the 'normal' state.
	$('#collapseOne').collapse("show");
	$('#collapseTwo').collapse("hide");
	// A return button is shown.
	$("#returnTPM").show();
	// The accordion is hidden.
	$("#accordion").hide();
	// The gene part is shown (part with the dashboards).
	$("#genePart").show();
	// The search value is cleared.
	$('#geneText').val("");
	});
	
	// When clicking upon the conditionSearch button
	$("body").on("click", "#conditionSearch", function(){
		// The tableContent is emptied
		$("#tableContent").empty();
		if ($('#conditionText').val() != "") {
			// Studies that contain the condition given in the searchbar are returned.
			$.get("/api/v2/Test_studies?q=Abstract=q="+$("#conditionText").val().replace(/ /g,'_')).done(function(data){
			var data = data["items"];
			var tdstart = "<td>";
			var tdend = "</td>";
			uniqueTitle = [];
			uniqueStudies = [];
			// The found studies are loaded into the studyTable.
			$.each(data, function(i, item){
				if ($.inArray(data[i]["Title"], uniqueTitle)== -1) {
					uniqueTitle.push(data[i]["Title"]);
					uniqueStudies.push(
						"<tr class='studyTable' id='" + data[i]["GEOD_NR"] + "' >" 
						+ tdstart + data[i]["Title"] + tdend
						+ tdstart + data[i]["Author"] + tdend 
						+ tdstart + data[i]["Organism"] + tdend 
						+ tdstart + data[i]["Year"] + tdend 
						+ "</tr>" );
		 			}
			});
		// These studies are sorted alphabetically on the GEOD number.
		uniqueStudies.sort()
		// Studies are joined with <br/> and written into the div tableContent.
		$("#tableContent").html(uniqueStudies.join("<br/>"));
			});
	// The accordion with the studies will open and the condition search part will close.
	$('#collapseOne').collapse("show");
	$('#collapseThree').collapse("hide");
	// A refresh button is showed to refresh all of the studies again.
	$("#refreshPublications").show();
	// The condition searchbar is emptied again.
	$('#conditionText').val("");
	}});

	// When clicking upon the refresh button 
	$("body").on("click", "#refreshPublications", function(){
	// All of the known studies are obtained. 
	$.get("/api/v2/Test_studies?attrs=Unique_ID,GEOD_NR,Title,Author,Organism,Year,Research_link&num=10000").done(function(data){
		var data = data["items"];
		var tdstart = "<td>";
		var tdend = "</td>";
		uniqueTitle = [];
		uniqueStudies = [];
		// Each of the known studies is added into the variable uniqueStudies.
		$.each(data, function(i, item){
			if ($.inArray(data[i]["Title"], uniqueTitle)== -1) {
				uniqueTitle.push(data[i]["Title"]);
				uniqueStudies.push(
					"<tr class='studyTable' id='" + data[i]["GEOD_NR"] + "' >" 
					+ tdstart + data[i]["Title"] + tdend
					+ tdstart + data[i]["Author"] + tdend 
					+ tdstart + data[i]["Organism"] + tdend 
					+ tdstart + data[i]["Year"] + tdend 
					+ "</tr>" );
	 			}
			});
		// These studies are sorted alphabetically on the GEOD number.
		uniqueStudies.sort()
		// Studies are joined with <br/> and written into the div tableContent.
		$("#tableContent").html(uniqueStudies.join("<br/>"));
	});
	// The refresh button is hidden again.
	$("#refreshPublications").hide();
	});

	//----------------------//
	//Tutorial part of GOAD.//
	//----------------------//
	
	// When clicking upon the close button of the tutorial pop up
	$("body").on("click", "#closeModal", function(){
		// Information about the QE and DE analysis is hidden.
		$('#QEanalysis').collapse('hide');
		$('#DEanalysis').collapse('hide');
	});
	
	// When clicking upon the DE information in the tutorial button the QE information is hidden.
	$("body").on("click", "#tutorialDEinfo", function(){
		$('#QEanalysis').collapse('hide');
	});

	// When clicking upon the QE information in the tutorial button the DE information is hidden.
	$("body").on("click", "#tutorialQEinfo", function(){
		$('#DEanalysis').collapse('hide');
	});

	// The input id filter is called (this input is used to filter the studies on the homepage).
    searchBar("#filter");
    
});
