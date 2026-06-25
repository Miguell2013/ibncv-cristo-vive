import React, { useEffect, useState } from 'react';
import { Platform, View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../constants/theme';

// Tarja "Adicionar à tela inicial" — só web. Android: dispara o instalador.
// iPhone: abre instruções. Some quando já instalado ou dispensado.
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const w = window as any;
    const standalone = (w.matchMedia && w.matchMedia('(display-mode: standalone)').matches) || w.navigator.standalone === true;
    if (standalone) return;
    try { if (w.localStorage.getItem('ibncv_install_dismissed') === '1') return; } catch {}

    const ua = w.navigator.userAgent || '';
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);
    if (ios) { setShow(true); return; }

    const onBIP = (e: any) => { e.preventDefault(); setDeferred(e); setShow(true); };
    const onInstalled = () => setShow(false);
    w.addEventListener('beforeinstallprompt', onBIP);
    w.addEventListener('appinstalled', onInstalled);
    return () => {
      w.removeEventListener('beforeinstallprompt', onBIP);
      w.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (Platform.OS !== 'web' || !show) return null;

  const steps = [
    '1. Abra no Safari (se abriu por outro app, toque em ··· → "Abrir no Safari").',
    '2. Toque no botão Compartilhar (quadradinho com seta ⬆, embaixo).',
    '3. Role e toque em "Adicionar à Tela de Início".',
    '4. Toque em "Adicionar". Pronto! 🤍',
  ];

  const onInstall = async () => {
    if (isIOS) { setIosOpen(true); return; }
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch {}
      setDeferred(null);
      setShow(false);
    }
  };
  const dismiss = () => {
    try { (window as any).localStorage.setItem('ibncv_install_dismissed', '1'); } catch {}
    setShow(false);
  };

  return (
    <>
      <View style={styles.banner as any}>
        <Ionicons name="download-outline" size={22} color={colors.bg} />
        <Text style={styles.msg}>Adicione o app Cristo Vive à tela inicial</Text>
        <Pressable onPress={onInstall} style={styles.btn} hitSlop={6}>
          <Text style={styles.btnTxt}>Instalar</Text>
        </Pressable>
        <Pressable onPress={dismiss} hitSlop={8}><Ionicons name="close" size={20} color={colors.bg} /></Pressable>
      </View>

      <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Instalar no iPhone</Text>
            {steps.map((s, i) => <Text key={i} style={styles.step}>{s}</Text>)}
            <Pressable onPress={() => setIosOpen(false)} style={{ alignSelf: 'flex-end', marginTop: spacing.sm }}>
              <Text style={styles.fechar}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.gold, paddingVertical: 12, paddingHorizontal: 16,
    maxWidth: 640, marginLeft: 'auto', marginRight: 'auto',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  msg: { flex: 1, fontFamily: fonts.bodyMedium, color: colors.bg, fontSize: 13 },
  btn: { backgroundColor: colors.bg, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16 },
  btnTxt: { fontFamily: fonts.bodyBold, color: colors.gold, fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: 'rgba(5,9,15,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.gold, padding: spacing.lg },
  modalTitle: { fontFamily: fonts.displaySemi, color: colors.gold, fontSize: 17, marginBottom: spacing.md },
  step: { fontFamily: fonts.body, color: colors.text, fontSize: 14, lineHeight: 21, marginBottom: spacing.sm },
  fechar: { fontFamily: fonts.bodyBold, color: colors.gold, fontSize: 14 },
});
