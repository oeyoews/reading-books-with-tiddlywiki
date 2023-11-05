# find image -type f -name '*-banner.png' -exec bash -c 'mv "$0" "${0//-banner}"' {} \;
find image -type f -name '*.png' ! -name '*-banner.png' -exec pngquant --ext .png --force {} \;