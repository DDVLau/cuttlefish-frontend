# Cuttlefish Frontend for Prolific Study

An alternative frontend for Cuttlefish home scheduler web application implemented in React using Bootstrap and Chart.js. Adapted from [kevinmcareavey/cuttlefish-frontend](https://github.com/kevinmcareavey/cuttlefish-frontend).

## Our Implementation
Components were deployed on an Ubuntu 22.04 virtual machine hosted on a virtual private server located in the UK.
During the study, the virtual machine was allocated 24 cores and 96 GB memory.
System and user data was stored in an SQLite database.

## Custom Configurations 
**Parameters for Battery and Appliances**: Amend the file `src/data/constants.js`.

**User Stories and Requirements**: Amend the file `src/data/requirements.js`.

**Tutorial**: Change the page under `src/pages/TutorialPage.js` and the figures under `src/images/`.

**Survey Questionnaire**: Please load your own questionnaire under `src/data/survey_*.js`.

## Citation
Please cite this paper using the recommended format:
```
@article{Liu_CoRR_2024,
  author       = {Xiaowei Liu and
                  Kevin McAreavey and
                  Weiru Liu},
  title        = {A User Study on Contrastive Explanations for Multi-Effector Temporal
                  Planning with Non-Stationary Costs},
  journal      = {CoRR},
  volume       = {abs/2409.13427},
  year         = {2024},
  url          = {https://doi.org/10.48550/arXiv.2409.13427},
  doi          = {10.48550/ARXIV.2409.13427},
  eprinttype    = {arXiv},
  eprint       = {2409.13427},
}
```