

sudo su
sudo yum -y install openssl

mkdir ca
chmod 600 ca
cd ca
openssl genrsa 2048 > private-key.pem
openssl req -new -key private-key.pem -out private-key.csr -subj "/C=JP/ST=Tokyo/O=example/CN=test.hoge.fuga.local"
echo subjectAltName=DNS:test.hoge.fuga.local > san.ext
openssl x509 -extfile san.ext -req -days 365000 -signkey private-key.pem < private-key.csr > private-server.pem
openssl x509 -in private-server.pem -inform PEM -out private-server.csr



ACMにインポート
証明書本文                 private-server.pem
証明書のプライベートキー    private-key.pem


