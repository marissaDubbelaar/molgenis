<div id="materialInfo">
	<div class="well">
		<h4>Data Processing</h4>

		The compute 5 pipeline from <a href="http://www.molgenis.org/wiki/ComputeStart">MOLGENIS</a> was used to process the data. 
		This pipeline contained several other features that where used to obtain results for GOAD. 
		Aligning was done with the use of <a href="http://www.ccb.jhu.edu/software/hisat/index.shtml">HISAT</a>.
		<a href="http://www.bioinformatics.babraham.ac.uk/index.html">FASTQC</a> was used to perform a quality check upon the obtained datasets.
		Several preprocessing steps for HTSeq with the use of <a href="http://broadinstitute.github.io/picard/">Picard</a> and <a href="http://samtools.sourceforge.net/">Samtools</a>.
		In the end <a href="https://pypi.python.org/pypi/HTSeq">HTSeq</a> was used to obtain the counts for the datasets.

		<br/>
		<h4>Datasets</h4>
		<ul>
			<li><a href="http://www.ebi.ac.uk/arrayexpress/experiments/E-GEOD-52946/">Butovsky et al. (2013)</a></li>
			<li><a href="http://www.ebi.ac.uk/arrayexpress/experiments/E-GEOD-43366/">Chiu et al. (2013)</a></li>
			<li><a href="http://www.ebi.ac.uk/arrayexpress/experiments/E-GEOD-66211/">Cronk et al. (2013)</a></li>
			<li><a href="http://www.ebi.ac.uk/arrayexpress/experiments/E-GEOD-52564/">Zhang et al. (2014)</a></li>
		</ul>

	</div>
</div>