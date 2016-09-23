###############################################################################
###  Resets CloudFront cache with boto/cfadmin utility
###  Run: ./this_script
###############################################################################

#
# Travis specific part - run this script only for production
#

if [[ $TRAVIS_BRANCH == 'master' ]]; then
    echo -e "\nThis is master/production branch - let's reset the CloudFront cache\n"
else
    echo -e "\nReset of CloudFront cache will not be started for non-production branch - exit.\n"
    exit 0
fi

#
# Install boto
#
echo -e "\nInstalling boto...\n"
git clone git://github.com/boto/boto.git
cd boto
sudo python setup.py install
cd ../
rm -rf boto

#
# Set up credentials for boto
#
echo -e "\nSet up boto credentials...\n"
echo "[Credentials]" >> ~/.boto
echo "aws_access_key_id = $1" >> ~/.boto
echo "aws_secret_access_key = $2" >> ~/.boto

echo -e "\nCloudFront Invalidating...\n"
cfadmin invalidate E1FB2YC929ZRCU "/*"

echo -e "\nInvalidating is in progress...\n"

#
# Clean up
#
echo -e "\nRemove boto config file\n"
rm ~/.boto
