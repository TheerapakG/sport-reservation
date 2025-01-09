FROM node:22

RUN apt update
RUN apt install -y libargon2-1

COPY ./cert/ca-certificate.crt /usr/local/share/ca-certificates/
RUN update-ca-certificatess

COPY ./.output ./.output

CMD [ "node", ".output/server/index.mjs" ]
