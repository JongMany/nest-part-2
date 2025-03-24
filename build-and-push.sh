#!/bin/bash

docker buildx build --platform linux/amd64,linux/arm64 -t jongmany/fc-nestjs-gateway -f ./apps/gateway/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jongmany/fc-nestjs-notification -f ./apps/notification/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jongmany/fc-nestjs-order -f ./apps/order/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jongmany/fc-nestjs-payment -f ./apps/payment/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jongmany/fc-nestjs-product -f ./apps/product/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jongmany/fc-nestjs-user -f ./apps/user/Dockerfile --target production .

docker push jongmany/fc-nestjs-gateway:latest 
docker push jongmany/fc-nestjs-notification:latest 
docker push jongmany/fc-nestjs-order:latest 
docker push jongmany/fc-nestjs-payment:latest 
docker push jongmany/fc-nestjs-product:latest 
docker push jongmany/fc-nestjs-user:latest 