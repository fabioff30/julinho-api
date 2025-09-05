Commit: Fix Docker deployment for WhatsApp service

- Add whatsapp-web.js to package.json dependencies
- Install Chromium in Docker image for Puppeteer support
- Configure PUPPETEER_EXECUTABLE_PATH for Docker environment
- Create whatsapp-session directory with proper permissions
- Add additional Puppeteer args for better Docker compatibility

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com> 
##########################################
### Download Github Archive Started...
### Fri, 05 Sep 2025 13:28:09 GMT
##########################################

#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.55kB done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.4s

#3 [internal] load .dockerignore
#3 transferring context: 1.50kB done
#3 DONE 0.0s

#4 [1/8] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 DONE 0.0s

#5 [2/8] WORKDIR /app
#5 CACHED

#6 [3/8] RUN addgroup -g 1001 -S nodejs &&     adduser -S nodejs -u 1001
#6 CACHED

#7 [internal] load build context
#7 transferring context: 174.82kB 0.0s done
#7 DONE 0.0s

#8 [4/8] RUN apk add --no-cache     dumb-init     chromium     nss     freetype     harfbuzz     ca-certificates     ttf-freefont     && rm -rf /var/cache/apk/*
#8 0.075 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/APKINDEX.tar.gz
#8 0.162 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/community/x86_64/APKINDEX.tar.gz
#8 0.549 (1/174) Installing ca-certificates (20250619-r0)
#8 0.598 (2/174) Installing libexpat (2.7.0-r0)
#8 0.604 (3/174) Installing brotli-libs (1.1.0-r2)
#8 0.616 (4/174) Installing libbz2 (1.0.8-r6)
#8 0.620 (5/174) Installing libpng (1.6.47-r0)
#8 0.624 (6/174) Installing freetype (2.13.3-r0)
#8 0.638 (7/174) Installing fontconfig (2.15.0-r1)
#8 0.670 (8/174) Installing libfontenc (1.1.8-r0)
#8 0.674 (9/174) Installing mkfontscale (1.2.3-r1)
#8 0.678 (10/174) Installing font-opensans (0_git20210927-r1)
#8 0.725 (11/174) Installing pkgconf (2.3.0-r0)
#8 0.732 (12/174) Installing libffi (3.4.7-r0)
#8 0.737 (13/174) Installing libintl (0.22.5-r0)
#8 0.741 (14/174) Installing libeconf (0.6.3-r0)
#8 0.746 (15/174) Installing libblkid (2.40.4-r1)
#8 0.751 (16/174) Installing libmount (2.40.4-r1)
#8 0.761 (17/174) Installing pcre2 (10.43-r0)
#8 0.772 (18/174) Installing glib (2.82.5-r0)
#8 0.842 (19/174) Installing xz-libs (5.6.3-r1)
#8 0.848 (20/174) Installing libxml2 (2.13.4-r6)
#8 0.868 (21/174) Installing shared-mime-info (2.4-r2)
#8 0.898 (22/174) Installing hicolor-icon-theme (0.18-r0)
#8 1.031 (23/174) Installing libjpeg-turbo (3.0.4-r0)
#8 1.042 (24/174) Installing libsharpyuv (1.4.0-r0)
#8 1.046 (25/174) Installing libwebp (1.4.0-r0)
#8 1.057 (26/174) Installing zstd-libs (1.5.6-r2)
#8 1.068 (27/174) Installing tiff (4.7.0-r0)
#8 1.078 (28/174) Installing gdk-pixbuf (2.42.12-r1)
#8 1.094 (29/174) Installing gtk-update-icon-cache (3.24.49-r0)
#8 1.103 (30/174) Installing libxau (1.0.11-r4)
#8 1.107 (31/174) Installing libmd (1.1.0-r0)
#8 1.111 (32/174) Installing libbsd (0.12.2-r0)
#8 1.114 (33/174) Installing libxdmcp (1.1.5-r1)
#8 1.118 (34/174) Installing libxcb (1.16.1-r0)
#8 1.138 (35/174) Installing libx11 (1.8.10-r0)
#8 1.207 (36/174) Installing libxcomposite (0.4.6-r5)
#8 1.212 (37/174) Installing libxfixes (6.0.1-r4)
#8 1.218 (38/174) Installing libxrender (0.9.11-r5)
#8 1.221 (39/174) Installing libxcursor (1.2.3-r0)
#8 1.225 (40/174) Installing libxdamage (1.1.6-r5)
#8 1.229 (41/174) Installing libxext (1.3.6-r2)
#8 1.232 (42/174) Installing libxi (1.8.2-r0)
#8 1.237 (43/174) Installing libxinerama (1.1.5-r4)
#8 1.241 (44/174) Installing libxrandr (1.5.4-r1)
#8 1.245 (45/174) Installing libatk-1.0 (2.54.1-r0)
#8 1.251 (46/174) Installing libxtst (1.2.5-r0)
#8 1.256 (47/174) Installing dbus-libs (1.14.10-r4)
#8 1.263 (48/174) Installing at-spi2-core (2.54.1-r0)
#8 1.275 (49/174) Installing libatk-bridge-2.0 (2.54.1-r0)
#8 1.282 (50/174) Installing pixman (0.43.4-r1)
#8 1.294 (51/174) Installing cairo (1.18.4-r0)
#8 1.319 (52/174) Installing cairo-gobject (1.18.4-r0)
#8 1.323 (53/174) Installing avahi-libs (0.8-r19)
#8 1.328 (54/174) Installing gmp (6.3.0-r2)
#8 1.339 (55/174) Installing nettle (3.10-r1)
#8 1.350 (56/174) Installing libunistring (1.2-r0)
#8 1.368 (57/174) Installing libidn2 (2.3.7-r0)
#8 1.375 (58/174) Installing libtasn1 (4.20.0-r0)
#8 1.381 (59/174) Installing p11-kit (0.25.5-r2)
#8 1.399 (60/174) Installing gnutls (3.8.8-r0)
#8 1.420 (61/174) Installing cups-libs (2.4.11-r0)
#8 1.431 (62/174) Installing libepoxy (1.5.10-r1)
#8 1.444 (63/174) Installing fribidi (1.0.16-r0)
#8 1.449 (64/174) Installing graphite2 (1.3.14-r6)
#8 1.453 (65/174) Installing harfbuzz (9.0.0-r1)
#8 1.510 (66/174) Installing libxft (2.3.8-r3)
#8 1.515 (67/174) Installing pango (1.54.0-r1)
#8 1.543 (68/174) Installing wayland-libs-client (1.23.1-r0)
#8 1.547 (69/174) Installing wayland-libs-cursor (1.23.1-r0)
#8 1.551 (70/174) Installing wayland-libs-egl (1.23.1-r0)
#8 1.555 (71/174) Installing xkeyboard-config (2.43-r0)
#8 1.733 (72/174) Installing libxkbcommon (1.7.0-r1)
#8 1.749 (73/174) Installing gtk+3.0 (3.24.49-r0)
#8 2.000 (74/174) Installing icu-data-full (74.2-r1)
#8 2.275 (75/174) Installing llvm19-libs (19.1.4-r1)
#8 6.020 (76/174) Installing hwdata-pci (0.393-r0)
#8 6.033 (77/174) Installing libpciaccess (0.18.1-r0)
#8 6.037 (78/174) Installing libdrm (2.4.123-r1)
#8 6.053 (79/174) Installing libelf (0.191-r0)
#8 6.057 (80/174) Installing mesa-glapi (24.2.8-r0)
#8 6.072 (81/174) Installing libxshmfence (1.3.2-r6)
#8 6.072 (82/174) Installing mesa (24.2.8-r0)
#8 7.998 (83/174) Installing wayland-libs-server (1.23.1-r0)
#8 8.003 (84/174) Installing mesa-gbm (24.2.8-r0)
#8 8.007 (85/174) Installing mesa-dri-gallium (24.2.8-r0)
#8 8.013 (86/174) Installing eudev-libs (3.2.14-r5)
#8 8.018 (87/174) Installing libmagic (5.46-r2)
#8 8.190 (88/174) Installing file (5.46-r2)
#8 8.194 (89/174) Installing xprop (1.2.8-r0)
#8 8.200 (90/174) Installing libice (1.1.1-r6)
#8 8.205 (91/174) Installing libuuid (2.40.4-r1)
#8 8.209 (92/174) Installing libsm (1.2.4-r4)
#8 8.215 (93/174) Installing libxt (1.3.1-r0)
#8 8.230 (94/174) Installing libxmu (1.2.1-r0)
#8 8.236 (95/174) Installing xset (1.2.5-r1)
#8 8.240 (96/174) Installing xdg-utils (1.2.1-r1)
#8 8.254 (97/174) Installing libogg (1.3.5-r5)
#8 8.258 (98/174) Installing libflac (1.4.3-r1)
#8 8.279 (99/174) Installing alsa-lib (1.2.12-r0)
#8 8.330 (100/174) Installing libSvtAv1Enc (2.2.1-r0)
#8 8.484 (101/174) Installing aom-libs (3.11.0-r0)
#8 8.673 (102/174) Installing libva (2.22.0-r1)
#8 8.683 (103/174) Installing libvdpau (1.5-r4)
#8 8.692 (104/174) Installing onevpl-libs (2023.3.1-r2)
#8 8.709 (105/174) Installing ffmpeg-libavutil (6.1.2-r1)
#8 8.728 (106/174) Installing libdav1d (1.5.0-r0)
#8 8.765 (107/174) Installing openexr-libiex (3.3.2-r0)
#8 8.786 (108/174) Installing openexr-libilmthread (3.3.2-r0)
#8 8.791 (109/174) Installing imath (3.1.12-r0)
#8 8.805 (110/174) Installing libdeflate (1.22-r0)
#8 8.814 (111/174) Installing openexr-libopenexrcore (3.3.2-r0)
#8 8.876 (112/174) Installing openexr-libopenexr (3.3.2-r0)
#8 8.901 (113/174) Installing giflib (5.2.2-r1)
#8 8.905 (114/174) Installing libhwy (1.0.7-r0)
#8 8.909 (115/174) Installing lcms2 (2.16-r0)
#8 8.925 (116/174) Installing libjxl (0.10.4-r0)
#8 9.026 (117/174) Installing lame-libs (3.100-r5)
#8 9.041 (118/174) Installing opus (1.5.2-r1)
#8 9.060 (119/174) Installing rav1e-libs (0.7.1-r0)
#8 9.115 (120/174) Installing libgomp (14.2.0-r4)
#8 9.131 (121/174) Installing soxr (0.1.3-r7)
#8 9.144 (122/174) Installing ffmpeg-libswresample (6.1.2-r1)
#8 9.153 (123/174) Installing libtheora (1.1.1-r18)
#8 9.181 (124/174) Installing libvorbis (1.3.7-r2)
#8 9.197 (125/174) Installing libvpx (1.15.0-r0)
#8 9.235 (126/174) Installing libwebpmux (1.4.0-r0)
#8 9.240 (127/174) Installing x264-libs (0.164.3108-r0)
#8 9.280 (128/174) Installing numactl (2.0.18-r0)
#8 9.285 (129/174) Installing x265-libs (3.6-r0)
#8 9.418 (130/174) Installing xvidcore (1.3.7-r2)
#8 9.428 (131/174) Installing ffmpeg-libavcodec (6.1.2-r1)
#8 9.674 (132/174) Installing libbluray (1.3.4-r1)
#8 9.690 (133/174) Installing mpg123-libs (1.32.9-r0)
#8 9.702 (134/174) Installing libopenmpt (0.7.12-r0)
#8 9.730 (135/174) Installing cjson (1.7.18-r0)
#8 9.735 (136/174) Installing mbedtls (3.6.4-r0)
#8 9.753 (137/174) Installing librist (0.2.10-r1)
#8 9.761 (138/174) Installing libsrt (1.5.3-r0)
#8 9.773 (139/174) Installing libssh (0.11.1-r0)
#8 9.783 (140/174) Installing libsodium (1.0.20-r0)
#8 9.792 (141/174) Installing libzmq (4.3.5-r2)
#8 9.801 (142/174) Installing ffmpeg-libavformat (6.1.2-r1)
#8 9.836 (143/174) Installing crc32c (1.1.2-r1)
#8 9.840 (144/174) Installing double-conversion (3.3.0-r0)
#8 9.845 (145/174) Installing harfbuzz-subset (9.0.0-r1)
#8 9.860 (146/174) Installing icu-libs (74.2-r1)
#8 9.902 (147/174) Installing minizip (1.3.1-r0)
#8 9.906 (148/174) Installing nspr (4.36-r0)
#8 9.926 (149/174) Installing sqlite-libs (3.48.0-r3)
#8 9.946 (150/174) Installing nss (3.109-r0)
#8 10.02 (151/174) Installing openh264 (2.6.0-r0)
#8 10.05 (152/174) Installing libcamera-ipa (0.3.2-r0)
#8 10.06 (153/174) Installing libunwind (1.8.1-r0)
#8 10.07 (154/174) Installing yaml (0.2.5-r2)
#8 10.08 (155/174) Installing libcamera (0.3.2-r0)
#8 10.12 (156/174) Installing speexdsp (1.2.1-r2)
#8 10.12 (157/174) Installing libuv (1.49.2-r0)
#8 10.13 (158/174) Installing roc-toolkit-libs (0.4.0-r0)
#8 10.16 (159/174) Installing libsndfile (1.2.2-r2)
#8 10.18 (160/174) Installing webrtc-audio-processing-1 (1.3-r1)
#8 10.21 (161/174) Installing pipewire-libs (1.2.7-r0)
#8 10.32 (162/174) Installing libasyncns (0.8-r4)
#8 10.33 (163/174) Installing libltdl (2.4.7-r3)
#8 10.33 (164/174) Installing orc (0.4.40-r1)
#8 10.35 (165/174) Installing tdb-libs (1.4.12-r0)
#8 10.36 (166/174) Installing libpulse (17.0-r4)
#8 10.39 (167/174) Installing libwebpdemux (1.4.0-r0)
#8 10.39 (168/174) Installing libgpg-error (1.51-r0)
#8 10.40 (169/174) Installing libgcrypt (1.10.3-r1)
#8 10.42 (170/174) Installing libxslt (1.1.42-r2)
#8 10.44 (171/174) Installing chromium (136.0.7103.113-r0)
#8 14.41 (172/174) Installing dumb-init (1.2.5-r3)
#8 14.41 (173/174) Installing encodings (1.0.7-r1)
#8 14.44 (174/174) Installing font-freefont (20120503-r4)
#8 14.52 Executing busybox-1.37.0-r12.trigger
#8 14.54 Executing ca-certificates-20250619-r0.trigger
#8 14.63 Executing fontconfig-2.15.0-r1.trigger
#8 14.69 Executing mkfontscale-1.2.3-r1.trigger
#8 14.76 Executing glib-2.82.5-r0.trigger
#8 14.77 Executing shared-mime-info-2.4-r2.trigger
#8 15.52 Executing gdk-pixbuf-2.42.12-r1.trigger
#8 15.53 Executing gtk-update-icon-cache-3.24.49-r0.trigger
#8 15.56 Executing gtk+3.0-3.24.49-r0.trigger
#8 15.58 OK: 727 MiB in 191 packages
#8 DONE 15.7s

#9 [5/8] COPY package*.json ./
#9 DONE 0.0s

#10 [6/8] RUN npm ci --only=production &&     npm cache clean --force
#10 0.250 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#10 5.199 npm error code EUSAGE
#10 5.199 npm error
#10 5.199 npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
#10 5.199 npm error
#10 5.199 npm error Missing: whatsapp-web.js@1.33.2 from lock file
#10 5.199 npm error Missing: @pedroslopez/moduleraid@5.0.2 from lock file
#10 5.199 npm error Missing: archiver@5.3.2 from lock file
#10 5.199 npm error Missing: fluent-ffmpeg@2.1.3 from lock file
#10 5.199 npm error Missing: fs-extra@10.1.0 from lock file
#10 5.199 npm error Missing: mime@3.0.0 from lock file
#10 5.199 npm error Missing: node-fetch@2.7.0 from lock file
#10 5.199 npm error Missing: node-webpmux@3.1.7 from lock file
#10 5.199 npm error Missing: puppeteer@18.2.1 from lock file
#10 5.199 npm error Missing: unzipper@0.10.14 from lock file
#10 5.199 npm error Missing: archiver-utils@2.1.0 from lock file
#10 5.199 npm error Missing: buffer-crc32@0.2.13 from lock file
#10 5.199 npm error Missing: readdir-glob@1.1.3 from lock file
#10 5.199 npm error Missing: tar-stream@2.2.0 from lock file
#10 5.199 npm error Missing: zip-stream@4.1.1 from lock file
#10 5.199 npm error Missing: glob@7.2.3 from lock file
#10 5.199 npm error Missing: graceful-fs@4.2.11 from lock file
#10 5.199 npm error Missing: lazystream@1.0.1 from lock file
#10 5.199 npm error Missing: lodash.defaults@4.2.0 from lock file
#10 5.199 npm error Missing: lodash.difference@4.5.0 from lock file
#10 5.199 npm error Missing: lodash.flatten@4.4.0 from lock file
#10 5.199 npm error Missing: lodash.isplainobject@4.0.6 from lock file
#10 5.199 npm error Missing: lodash.union@4.6.0 from lock file
#10 5.199 npm error Missing: readable-stream@2.3.8 from lock file
#10 5.199 npm error Missing: async@0.2.10 from lock file
#10 5.199 npm error Missing: which@1.3.1 from lock file
#10 5.199 npm error Missing: jsonfile@6.2.0 from lock file
#10 5.199 npm error Missing: universalify@2.0.1 from lock file
#10 5.199 npm error Missing: fs.realpath@1.0.0 from lock file
#10 5.199 npm error Missing: inflight@1.0.6 from lock file
#10 5.199 npm error Missing: once@1.4.0 from lock file
#10 5.199 npm error Missing: path-is-absolute@1.0.1 from lock file
#10 5.199 npm error Missing: wrappy@1.0.2 from lock file
#10 5.199 npm error Missing: readable-stream@2.3.8 from lock file
#10 5.199 npm error Missing: whatwg-url@5.0.0 from lock file
#10 5.199 npm error Missing: https-proxy-agent@5.0.1 from lock file
#10 5.199 npm error Missing: progress@2.0.3 from lock file
#10 5.199 npm error Missing: proxy-from-env@1.1.0 from lock file
#10 5.199 npm error Missing: puppeteer-core@18.2.1 from lock file
#10 5.199 npm error Missing: agent-base@6.0.2 from lock file
#10 5.199 npm error Missing: debug@4.4.1 from lock file
#10 5.199 npm error Missing: debug@4.4.1 from lock file
#10 5.199 npm error Missing: cross-fetch@3.1.5 from lock file
#10 5.199 npm error Missing: debug@4.3.4 from lock file
#10 5.199 npm error Missing: devtools-protocol@0.0.1045489 from lock file
#10 5.199 npm error Missing: extract-zip@2.0.1 from lock file
#10 5.199 npm error Missing: rimraf@3.0.2 from lock file
#10 5.199 npm error Missing: tar-fs@2.1.1 from lock file
#10 5.199 npm error Missing: unbzip2-stream@1.4.3 from lock file
#10 5.199 npm error Missing: ws@8.9.0 from lock file
#10 5.199 npm error Missing: node-fetch@2.6.7 from lock file
#10 5.199 npm error Missing: @types/yauzl@2.10.3 from lock file
#10 5.199 npm error Missing: debug@4.4.1 from lock file
#10 5.199 npm error Missing: get-stream@5.2.0 from lock file
#10 5.199 npm error Missing: yauzl@2.10.0 from lock file
#10 5.199 npm error Missing: @types/node@24.3.1 from lock file
#10 5.199 npm error Missing: undici-types@7.10.0 from lock file
#10 5.199 npm error Missing: pump@3.0.3 from lock file
#10 5.199 npm error Missing: end-of-stream@1.4.5 from lock file
#10 5.199 npm error Missing: minimatch@5.1.6 from lock file
#10 5.199 npm error Missing: chownr@1.1.4 from lock file
#10 5.199 npm error Missing: mkdirp-classic@0.5.3 from lock file
#10 5.199 npm error Missing: bl@4.1.0 from lock file
#10 5.199 npm error Missing: fs-constants@1.0.0 from lock file
#10 5.199 npm error Missing: buffer@5.7.1 from lock file
#10 5.199 npm error Missing: base64-js@1.5.1 from lock file
#10 5.199 npm error Missing: ieee754@1.2.1 from lock file
#10 5.199 npm error Missing: through@2.3.8 from lock file
#10 5.199 npm error Missing: big-integer@1.6.52 from lock file
#10 5.199 npm error Missing: binary@0.3.0 from lock file
#10 5.199 npm error Missing: bluebird@3.4.7 from lock file
#10 5.199 npm error Missing: buffer-indexof-polyfill@1.0.2 from lock file
#10 5.199 npm error Missing: duplexer2@0.1.4 from lock file
#10 5.199 npm error Missing: fstream@1.0.12 from lock file
#10 5.199 npm error Missing: listenercount@1.0.1 from lock file
#10 5.199 npm error Missing: readable-stream@2.3.8 from lock file
#10 5.199 npm error Missing: setimmediate@1.0.5 from lock file
#10 5.199 npm error Missing: buffers@0.1.1 from lock file
#10 5.199 npm error Missing: chainsaw@0.1.0 from lock file
#10 5.199 npm error Missing: traverse@0.3.9 from lock file
#10 5.199 npm error Missing: readable-stream@2.3.8 from lock file
#10 5.199 npm error Missing: mkdirp@0.5.6 from lock file
#10 5.199 npm error Missing: rimraf@2.7.1 from lock file
#10 5.199 npm error Missing: minimist@1.2.8 from lock file
#10 5.199 npm error Missing: tr46@0.0.3 from lock file
#10 5.199 npm error Missing: webidl-conversions@3.0.1 from lock file
#10 5.199 npm error Missing: isexe@2.0.0 from lock file
#10 5.199 npm error Missing: fd-slicer@1.1.0 from lock file
#10 5.199 npm error Missing: pend@1.2.0 from lock file
#10 5.199 npm error Missing: archiver-utils@3.0.4 from lock file
#10 5.199 npm error Missing: compress-commons@4.1.2 from lock file
#10 5.199 npm error Missing: crc32-stream@4.0.3 from lock file
#10 5.199 npm error Missing: crc-32@1.2.2 from lock file
#10 5.199 npm error Missing: ms@2.1.3 from lock file
#10 5.199 npm error Missing: core-util-is@1.0.3 from lock file
#10 5.199 npm error Missing: isarray@1.0.0 from lock file
#10 5.199 npm error Missing: process-nextick-args@2.0.1 from lock file
#10 5.199 npm error Missing: safe-buffer@5.1.2 from lock file
#10 5.199 npm error Missing: string_decoder@1.1.1 from lock file
#10 5.199 npm error Missing: safe-buffer@5.1.2 from lock file
#10 5.199 npm error Missing: string_decoder@1.1.1 from lock file
#10 5.199 npm error Missing: ms@2.1.3 from lock file
#10 5.199 npm error Missing: ms@2.1.3 from lock file
#10 5.199 npm error Missing: safe-buffer@5.1.2 from lock file
#10 5.199 npm error Missing: string_decoder@1.1.1 from lock file
#10 5.199 npm error Missing: ms@2.1.2 from lock file
#10 5.199 npm error Missing: brace-expansion@2.0.2 from lock file
#10 5.199 npm error Missing: safe-buffer@5.1.2 from lock file
#10 5.199 npm error Missing: string_decoder@1.1.1 from lock file
#10 5.199 npm error
#10 5.199 npm error Clean install a project
#10 5.199 npm error
#10 5.199 npm error Usage:
#10 5.199 npm error npm ci
#10 5.199 npm error
#10 5.199 npm error Options:
#10 5.199 npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
#10 5.199 npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
#10 5.199 npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
#10 5.199 npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
#10 5.199 npm error [--no-bin-links] [--no-fund] [--dry-run]
#10 5.199 npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
#10 5.199 npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
#10 5.199 npm error
#10 5.199 npm error aliases: clean-install, ic, install-clean, isntall-clean
#10 5.199 npm error
#10 5.199 npm error Run "npm help ci" for more info
#10 5.201 npm notice
#10 5.201 npm notice New major version of npm available! 10.8.2 -> 11.6.0
#10 5.201 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.0
#10 5.201 npm notice To update run: npm install -g npm@11.6.0
#10 5.201 npm notice
#10 5.202 npm error A complete log of this run can be found in: /root/.npm/_logs/2025-09-05T13_28_26_744Z-debug-0.log
#10 ERROR: process "/bin/sh -c npm ci --only=production &&     npm cache clean --force" did not complete successfully: exit code: 1
------
 > [6/8] RUN npm ci --only=production &&     npm cache clean --force:
5.199 npm error
5.199 npm error aliases: clean-install, ic, install-clean, isntall-clean
5.199 npm error
5.199 npm error Run "npm help ci" for more info
5.201 npm notice
5.201 npm notice New major version of npm available! 10.8.2 -> 11.6.0
5.201 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.0
5.201 npm notice To update run: npm install -g npm@11.6.0
5.201 npm notice
5.202 npm error A complete log of this run can be found in: /root/.npm/_logs/2025-09-05T13_28_26_744Z-debug-0.log
------
Dockerfile:29
--------------------
  28 |     # Install production dependencies only
  29 | >>> RUN npm ci --only=production && \
  30 | >>>     npm cache clean --force
  31 |     
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci --only=production &&     npm cache clean --force" did not complete successfully: exit code: 1
##########################################
### Error
### Fri, 05 Sep 2025 13:28:31 GMT
##########################################

Command failed with exit code 1: docker buildx build --network host -f /etc/easypanel/projects/julinho-ia/julinho-api/code/Dockerfile -t easypanel/julinho-ia/julinho-api --label 'keep=true' --build-arg 'NODE_ENV=production' --build-arg 'PORT=4000' --build-arg 'DB_HOST=147.93.15.49' --build-arg 'DB_PORT=3001' --build-arg 'DB_NAME=julinho-ia' --build-arg 'DB_USER=postgres' --build-arg 'DB_PASSWORD=Ifabio3740%' --build-arg 'REDIS_HOST=147.93.15.49' --build-arg 'REDIS_PORT=3002' --build-arg 'REDIS_PASSWORD=Ifabio3740%' --build-arg 'DASHBOARD_SECRET=a1b2c3' --build-arg 'RATE_LIMIT_WINDOW_MS=60000' --build-arg 'RATE_LIMIT_MAX_REQUESTS=100' --build-arg 'LOG_LEVEL=info' --build-arg 'LOG_MAX_SIZE=20m' --build-arg 'LOG_MAX_FILES=5d' --build-arg 'GIT_SHA=f844fc6b6f43b6427cdbd471e2b6164e722c8507' /etc/easypanel/projects/julinho-ia/julinho-api/code/