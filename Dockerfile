
FROM ubuntu:18.04

LABEL name="jasontron" \
      version="0.1"

COPY . /app

RUN apt-get update && \
    apt-get -y install xvfb gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
      libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
      libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
      libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get -yq install nodejs npm

# RUN apt-get update && apt-get install -y \
#  wget \
#  --no-install-recommends \
#  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#  && apt-get update && apt-get install -y \
#  google-chrome-stable \
#  --no-install-recommends \
#  && rm -rf /var/lib/apt/lists/*
#
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

WORKDIR /app

RUN npm install || \
  ((if [ -f npm-debug.log ]; then \
      cat npm-debug.log; \
    fi) && false)

RUN npm run build

ENTRYPOINT [ "npm" ]
CMD ["run", "start"]
