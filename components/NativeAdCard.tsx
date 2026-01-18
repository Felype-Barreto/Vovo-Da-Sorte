import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AdvertiserView, CallToActionView, HeadlineView, IconView, MediaView, NativeAdView, StarRatingView, TaglineView, TestIds } from 'react-native-google-mobile-ads';

// ID do anúncio nativo fornecido
const adUnitId = __DEV__ ? TestIds.NATIVE : 'ca-app-pub-1873423099734846/6075733349';

export function NativeAdCard() {
  return (
    <NativeAdView
      style={styles.container}
      adUnitId={adUnitId}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    >
      <View style={styles.row}>
        <IconView style={styles.icon} />
        <View style={styles.textContent}>
          <HeadlineView style={styles.headline} numberOfLines={1} />
          <TaglineView style={styles.tagline} numberOfLines={2} />
          <AdvertiserView style={styles.advertiser} numberOfLines={1} />
          <StarRatingView style={styles.stars} />
        </View>
        <CallToActionView style={styles.cta} textStyle={styles.ctaText} />
      </View>
      <MediaView style={styles.media} />
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#232a38',
    padding: 14,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#181c24',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: 13,
    color: '#b0b0b0',
    marginTop: 2,
  },
  advertiser: {
    fontSize: 12,
    color: '#20d361',
    marginTop: 2,
  },
  stars: {
    marginTop: 2,
    height: 16,
  },
  cta: {
    backgroundColor: '#20d361',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  ctaText: {
    color: '#001a17',
    fontWeight: 'bold',
    fontSize: 14,
  },
  media: {
    height: 120,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#181c24',
  },
});
