#!/bin/bash

# MongoDB Data Viewer for ChatApp
# Usage: ./view-db.sh [collection_name]

CONTAINER_NAME="chat-mongodb"
DB_NAME="chatapp"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo "  CHATAPP DATABASE - DATA VIEWER"
echo -e "==========================================${NC}"
echo ""

# If specific collection is passed
if [ ! -z "$1" ]; then
    echo -e "${GREEN}📊 Viewing: $1${NC}"
    docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.$1.find().pretty()"
    exit 0
fi

# Show all data
echo -e "${GREEN}📊 Collections:${NC}"
docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.getCollectionNames()"
echo ""

echo -e "${GREEN}👥 Users: ${NC}"
USER_COUNT=$(docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.users.countDocuments()")
echo "Total: $USER_COUNT"
docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.users.find({}, {password: 0}).forEach(u => printjson(u))"
echo ""

echo -e "${GREEN}💬 Chats: ${NC}"
CHAT_COUNT=$(docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.chats.countDocuments()")
echo "Total: $CHAT_COUNT"
if [ "$CHAT_COUNT" -gt 0 ]; then
    docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.chats.find().forEach(c => printjson(c))"
fi
echo ""

echo -e "${GREEN}📨 Messages: ${NC}"
MSG_COUNT=$(docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.messages.countDocuments()")
echo "Total: $MSG_COUNT"
if [ "$MSG_COUNT" -gt 0 ]; then
    docker exec $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.messages.find().limit(10).forEach(m => printjson(m))"
    if [ "$MSG_COUNT" -gt 10 ]; then
        echo -e "${YELLOW}... (showing first 10 of $MSG_COUNT messages)${NC}"
    fi
fi
echo ""

echo -e "${BLUE}==========================================${NC}"
echo -e "Usage: ${YELLOW}./view-db.sh${NC}          - View all data"
echo -e "       ${YELLOW}./view-db.sh users${NC}    - View only users"
echo -e "       ${YELLOW}./view-db.sh chats${NC}    - View only chats"
echo -e "       ${YELLOW}./view-db.sh messages${NC} - View only messages"
echo -e "${BLUE}==========================================${NC}"

