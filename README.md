

# vsphere-doc-scrape



## Usage

To generate the schema for version 6.5, you have to download the SDK from VMWare:

Go to [vSphere Management SDK for vSphere 6.5](https://code.vmware.com/web/sdk/65/vsphere-management)

In section 1 "Downloads": vSphere Management SDK -> Download

You will go to [VMware vSphere Management SDK 6.5](https://my.vmware.com/group/vmware/get-download?downloadGroup=VS-MGMT-SDK65)

Download file "VMware-vSphereSDK-6.5.0-4571253.zip" (88.4 MB)

```
unzip VMware-vSphereSDK-6.5.0-4571253.zip
mkdir docs/6.5
cp -r SDK/vsphere-ws/docs/ReferenceGuide docs/6.5

# don't forget to modify "ver = '6.5';" in core/scrape.js

node core/scrape.js

# the generated schema file is docs/6.5/index.js
```



## Developing



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
