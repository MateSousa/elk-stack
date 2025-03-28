#!/bin/bash

# Wait for Kibana to be ready
until curl -s "http://kibana:5601/api/status" > /dev/null; do
    echo "Waiting for Kibana..."
    sleep 5
done

# Import the dashboard
curl -X POST "http://kibana:5601/api/saved_objects/_import" \
    -H "kbn-xsrf: true" \
    --form file=@/kibana/dashboard.ndjson

echo "Dashboard imported successfully!" 