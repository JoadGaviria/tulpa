"""Tulpa optional sender. Default: local validation only; no network or credentials needed.

Uses python-telegram-bot, following the official async Bot API pattern.
Secrets remain in environment variables. Only a single-family event is accepted.
"""
import argparse
import asyncio
import hashlib
import json
import os
import pathlib
import sqlite3

def validate(event):
    if not isinstance(event,dict) or event.get('schema') != 'tulpa.delivery.v1':
        raise ValueError('Esquema de evento incorrecto.')
    if event.get('family') not in ['A','B'] or event.get('language') not in ['es','nasa','namtrik']:
        raise ValueError('Familia o idioma inválido.')
    kg=event.get('accepted_kg')
    if type(kg) not in (int,float) or not 0 <= kg <= 20:
        raise ValueError('Peso inválido.')
    if not isinstance(event.get('id'),str) or not 1<=len(event['id'])<=80:
        raise ValueError('ID inválido.')
    if event.get('lot')!='M01' or event.get('demo') is not True:
        raise ValueError('Este adaptador solo admite la demo M01.')
    return event

def text_for(e):
    return f"Tulpa · DEMOSTRACIÓN\nFamilia {e['family']}, recibimos {e['accepted_kg']:g} kg de mora. Lote {e['lot']}.\nSu pago depende de las ventas cobradas. Este mensaje no confirma una transferencia."

async def send(event, audio, db_path, expected_recipient):
    from telegram import Bot
    token=os.environ.get('TELEGRAM_BOT_TOKEN')
    chat=os.environ.get(f"TELEGRAM_CHAT_ID_{event['family']}")
    if not token or not chat:
        raise ValueError('Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID_A/B fuera del código.')
    if expected_recipient != chat:
        raise ValueError('El destinatario confirmado no coincide con la variable de entorno.')
    if not audio or not audio.is_file() or audio.suffix.lower() not in ['.ogg','.mp3','.m4a']:
        raise ValueError('Se requiere un audio autorizado .ogg, .mp3 o .m4a con la confirmación de esta entrega.')
    if audio.stat().st_size>10_000_000:
        raise ValueError('El audio supera 10 MB.')
    digest=hashlib.sha256(json.dumps(event,sort_keys=True).encode()).hexdigest()
    with sqlite3.connect(db_path) as db:
        db.execute('CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, digest TEXT NOT NULL, state TEXT NOT NULL)')
        existing=db.execute('SELECT digest,state FROM outbox WHERE id=?',(event['id'],)).fetchone()
        if existing:
            if existing[0]!=digest: raise ValueError('ID reutilizado para un contenido diferente.')
            print('Evento ya registrado: '+existing[1]+'. No se reenvía automáticamente.');return
        # Claim before sending: a crash/timeout is ambiguous; human review avoids duplicate messages.
        db.execute('INSERT INTO outbox VALUES (?,?,?)',(event['id'],digest,'inflight'));db.commit()
        async with Bot(token=token) as bot:
            await bot.send_message(chat_id=chat,text=text_for(event))
            with audio.open('rb') as clip:
                if audio.suffix.lower()=='.ogg':
                    await bot.send_voice(chat_id=chat,voice=clip)
                else:
                    await bot.send_audio(chat_id=chat,audio=clip)
        db.execute('UPDATE outbox SET state=? WHERE id=?',('sent',event['id']));db.commit()
    print('Mensaje y audio enviados. ID '+event['id'])

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('event',type=pathlib.Path)
    p.add_argument('--send',action='store_true',help='Activa el envío explícitamente.')
    p.add_argument('--audio',type=pathlib.Path)
    p.add_argument('--confirm-recipient',help='Chat ID autorizado por su titular.')
    p.add_argument('--db',type=pathlib.Path,default=pathlib.Path(__file__).with_name('outbox.sqlite'))
    args=p.parse_args()
    if args.event.stat().st_size>16000:raise ValueError('Evento demasiado grande.')
    e=validate(json.loads(args.event.read_text(encoding='utf-8-sig')))
    if not args.send:
        print('MODO LOCAL · no se envía nada\n'+text_for(e))
        print('Idioma solicitado: '+e['language']+'. El audio debe estar autorizado y coincidir con la entrega.')
    else:asyncio.run(send(e,args.audio,args.db,args.confirm_recipient))

if __name__=='__main__':main()
