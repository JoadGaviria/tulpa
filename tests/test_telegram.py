import importlib.util, pathlib, unittest
path=pathlib.Path(__file__).resolve().parents[1]/'integrations/telegram_bot.py'
spec=importlib.util.spec_from_file_location('telegram_adapter',path)
bot=importlib.util.module_from_spec(spec);spec.loader.exec_module(bot)
class TelegramTests(unittest.TestCase):
    def event(self):return {'schema':'tulpa.delivery.v1','id':'test-1','demo':True,'lot':'M01','family':'B','accepted_kg':8,'language':'es'}
    def test_valid_event_and_private_text(self):
        e=bot.validate(self.event());text=bot.text_for(e)
        self.assertIn('Familia B',text);self.assertIn('8 kg',text);self.assertNotIn('Familia A',text)
    def test_invalid_payload(self):
        for field,value in [('accepted_kg',-1),('accepted_kg',True),('accepted_kg',float('nan')),('family','C'),('language','auto'),('lot','M02'),('demo',False)]:
            e=self.event();e[field]=value
            with self.assertRaises(ValueError):bot.validate(e)
if __name__=='__main__':unittest.main()
