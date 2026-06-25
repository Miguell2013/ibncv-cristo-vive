import React, { useEffect, useState } from 'react';
import { Platform, View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { useIdentity } from '../contexts/identity';
import { pushSuportado, pushAtivo, ativarAvisos } from '../services/push';

// Janela que convida o membro a ativar as notificações (palavra do dia etc.).
// Aparece depois do cadastro, no web/PWA, só pra quem ainda não ativou.
export function PushPrompt() {
  const { identificado, identidade } = useIdentity();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (!identificado) return;
    if (!pushSuportado()) return;
    const w = window as any;
    try {
      if (w.Notification && w.Notification.permission === 'denied') return;
      if (w.localStorage.getItem('ibncv_push_dismissed') === '1') return;
      const ua = w.navigator.userAgent || '';
      const ios = /iphone|ipad|ipod/i.test(ua);
      const standalone = (w.matchMedia && w.matchMedia('(display-mode: standalone)').matches) || w.navigator.standalone === true;
      if (ios && !standalone) return; // iPhone só com app instalado
    } catch { return; }
    let alive = true;
    pushAtivo().then((on) => {
      if (!alive || on) return;
      setTimeout(() => { if (alive) setShow(true); }, 2500);
    });
    return () => { alive = false; };
  }, [identificado]);

  if (Platform.OS !== 'web' || !show) return null;

  const dismiss = () => {
    try { (window as any).localStorage.setItem('ibncv_push_dismissed', '1'); } catch {}
    setShow(false);
  };

  const onAtivar = async () => {
    setBusy(true); setMsg(null);
    const r = await ativarAvisos(identidade?.pessoaId);
    setBusy(false);
    setMsg(r.msg);
    if (r.ok) {
      try { (window as any).localStorage.setItem('ibncv_push_dismissed', '1'); } catch {}
      setTimeout(() => setShow(false), 1800);
    }
  };

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.bell}><Ionicons name="notifications" size={30} color={colors.gold} /></View>
          <Text style={styles.title}>Uma palavra todo dia 🕊️</Text>
          <Text style={styles.body}>Ative as notificações e receba a Palavra Pastoral do Dia direto no seu celular, toda manhã. Queremos caminhar com você. 🤍</Text>
          {msg && <Text style={styles.msg}>{msg}</Text>}
          <Pressable style={({ pressed }) => [styles.yes, pressed && styles.pressed, busy && { opacity: 0.7 }]} onPress={onAtivar} disabled={busy}>
            <Ionicons name="notifications-outline" size={18} color={colors.bg} />
            <Text style={styles.yesTxt}>Sim, quero receber</Text>
          </Pressable>
          <Pressable style={styles.no} onPress={dismiss}><Text style={styles.noTxt}>Agora não</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,9,15,0.75)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.gold, padding: spacing.xl, alignItems: 'center', ...shadow.glow },
  bell: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.gold, marginBottom: spacing.md },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 20, textAlign: 'center' },
  body: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },
  msg: { fontFamily: fonts.bodyMedium, color: colors.green, fontSize: 13, textAlign: 'center', marginBottom: spacing.md },
  yes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, alignSelf: 'stretch' },
  yesTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15 },
  no: { paddingVertical: spacing.sm, marginTop: spacing.xs },
  noTxt: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 13 },
  pressed: { opacity: 0.85 },
});
