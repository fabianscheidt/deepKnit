# deepKnit Tensorflow

This repository contains the data and scripts for preprocessing, training and serving the deepKnit project. This
descriptions explains the working principle of the most recent model, based on knitting patterns obtained from the
staf platform.

## Technical architecture

All the code for data processing is written in Python. The recommended version to be used is Python 3.6.3. The models
are trained and inferred with [Tensorflow](https://www.tensorflow.org) preferably with GPU support. The high-level API 
[Keras](https://www.tensorflow.org/guide/keras) is used. The models can be used through a simple web server built using
[Flask](http://flask.pocoo.org). The frontend shown in the demo can be found in a separate repository.

The results shown in the deepKnit Frontend require 3 steps:

1. **Crawl the data**
   The training data is downloaded. Since the download takes long and requires a login, a copy is stored in this
   repository.

2. **Preprocess the data**  
   The training data is provided in the proprietary dat and lep format. The byte data in these files needs to be 
   extacted and cleand up to be more meaningful for the Training. The header information is removed and the data is
   concatenated into a single numpy array.
   
3. **Train a model on the training data**  
   A multi layer LSTM is trained onto the previously generated training data. The implementation of the LSTM is roughly
   based on the keras text generation example [here](https://www.tensorflow.org/tutorials/sequences/text_generation).
   
4. **Serve the trained model**  
   The trained models are accessible using a simple Flask-based web server.
   
Once the models are trained, the architecture of the running demo application looks like this:

```text
                   +----------------------------+
                   |      Angular Frontend      |
                   +----------------------------+
                                | ^
                   HTTP-Request | | HTTP-Response (Chunked bytes of JSON)
                                v |
+-----------------------------------------------------------------------+
|                  Apache with mod_wsgi and mod_proxy                   |
+-----------------------------------------------------------------------+
              | ^                                 | ^
    WSGI call | | WSGI response      POST request | | Image
              v |                                 v |
+------------------------------+     +----------------------------------+
|          Flask Server        |     |      Flask Server executing      |
|       running Tensorflow     |     |     LoopConvert.exe on APEX      |
+------------------------------+     +----------------------------------+
               ^                            |                  | ^
Trained Models |                        cmd |         DAT-file | | Image
               |                            v                  v |
+------------------------------+     +-------------+     +--------------+
|          Filesystem          |     | LoopConvert | <-> |  Filesystem  |
+------------------------------+     +-------------+     +--------------+
```

## Reproducing the results

All the scripts should be run from the `src` directory of this repository. Following the steps below should yields to
properly trained models that can be evaluated from the DeepKnit Frontend.

#### Install dependencies

Install the project dependencies by running `pip3 install -r requirements.txt`.

#### Generate the training files

Based on the raw data found in the repository the training files can be generated by running 
`python3 lstm_staf.py generate-training-file`.

#### Train the models

The training can be started by running `python3 lstm_staf.py train`. In our tests 200 epochs gave best results, so the
training can be stopped after that by hitting Ctr+C. Using a GPU for the training is highly recommended to achieve
reasonable speeds. The training process is logged and can be watched with Tensorboard in the folder
`output/models/lstm-staf/tensorboard-log`.

#### Build the frontend

Instructions on how to build the frontend can be found in the corresponding repository. The generated files should be
placed in a folder called `static`.

#### Serve the trained models

Start the server by running `python3 server.py`. Open a browser and go to [http://localhost:5000](http://localhost:5000).

## Beyond reproduction

For our research we created a few additional scripts to handle dat files and training results, so looking at the
following scrips might be helpful when working from our results.

#### KnitPaint Utilities

The knitpaint-utils repository has various methods to read KnitPaint data from different sources, modify and normalize
it, generate previews and export it. It also includes the check if a pattern can be knitted.

#### Generator Scripts

Some of the functionality of KnitPaintFileHandler is available using a command line interface from `generate.py`. When
working with image previews of Knitpaint especially `python3 generate.py dat-from-image <input> <output>` might be 
useful to export back to the dat format.