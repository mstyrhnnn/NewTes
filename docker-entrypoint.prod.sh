#!/bin/bash

npm run migrate:seed
pm2-runtime start pm2/config.pm2.prod.json
