# Mapper Interactive Command Line Interface

---

### Additional Requirements:

* [tqdm](https://github.com/tqdm/tqdm)
* [PyTorch](https://pytorch.org/) (If GPU acceleration is desired. CUDA device required.)

---

### Quickstart

To only perform data wrangling:

```bash
python data.csv --preprocess-only
```

Example mapper graph computation with parameters:

* Intervals 10, 20, 30, 40, 50
* Overlaps 25%, 30%, 35%
* DBSCAN Epsilon = 0.5
* DBSCAN num_pts = 5
* Filter Function = L2norm
* Graphs stored in ./`CLI_examples/`

```bash
python data.csv --intervals 10:50:10 --overlaps 25:35:5 --eps 0.5 --num_pts 5 --filter l2norm --output ./CLI_examples
```

---

### Output format

Unless specified with the output flag, the default export directory is `./graph/`. Each mapper graph has the form "mapper\_{file name of data}\_{interval}\_{overlap}.json" where overlap is the integer representing a percent (i.e. 35 for 35%). There are two additional files. `./graph/wrangled_data.csv` contains the processed data if preprocessing was requested and `./graph/metadata.json` contains parameters passed to the CLI tool.

---

### Full List of Parameters

Positional Arguments

* `input`: the data in csv format to run Mapper and / or to wrangle.

Flag Arguments

* `-i` or `--intervals`: The intervals to use of the form START:END:STEP where start and end are inclusive.
* `-o` or `--overlaps`: The overlaps to use of the form START:END:STEP where start and end are inclusive. These must be integers corresponding to percents, not floats.
* `-output`: Output directory. Defaults to `./graph/`
* `--no-preprocess`: Boolean flag to omit preprocessing. If used, not `wrangled_data.csv` will be produced.
* `--threads`: Number of threads to use when computing pairwise distances for clustering. -1 means uses all available processors.
* `--eps`: Epsilon parameter passed to DBSCAN.
* `--num_pts`: num_pts parameter passed to DBSCAN. Defaults to 5.
* `--norm`: Normalization of points before computing the mapper graph. Possible choices include: None, 0-1, l1, l2, max. Defaults to None.
* `--gpu`: Boolean flag to indicate whether GPU acceleration should be used. Requires PyTorch and a CUDA compatible device. If the CUDA device runs out of memory, distance computation defaults to the CPU. **Note: Using a GPU might cause small numerical inaccuracies. Preliminary testing shows 5e-5 tolerance.** GPU Acceleration only available when using a euclidean metric.
* `--metric`: Metric to pass to DBSCAN. Any Scikit-learn metric. Defaults to euclidean.
* `--preprocess_only`: Boolean flag to only wrangle the data. No mapper graphs are computed.

----

### Bug Reporting

Please submit an issue with the exact command ran and full text of the error.