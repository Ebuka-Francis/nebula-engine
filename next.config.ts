const nextConfig = {
   async headers() {
      return [
         {
            source: '/(.*)',
            headers: [
               { key: 'Access-Control-Allow-Origin', value: '*' },
               {
                  key: 'Access-Control-Allow-Methods',
                  value: 'GET,POST,OPTIONS',
               },
               { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
            ],
         },
      ];
   },
   experimental: {
      allowedDevOrigins: ['172.20.10.2'],
   },
};

export default nextConfig;
