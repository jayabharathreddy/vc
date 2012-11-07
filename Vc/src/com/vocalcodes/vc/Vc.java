package com.vocalcodes.vc;

import org.apache.cordova.DroidGap;
import android.os.Bundle;

public class Vc  extends DroidGap{

    @Override
    public void onCreate(Bundle savedInstanceState) {
    	  super.onCreate(savedInstanceState);
          super.init();
          super.appView.clearCache(true);
          super.appView.clearHistory(); 
          super.setIntegerProperty("loadUrlTimeoutValue", 80000);
          super.loadUrl("file:///android_asset/www/pages/index.html");
    }

   
}
