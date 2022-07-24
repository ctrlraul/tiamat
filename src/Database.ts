import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TextBasedChannel } from 'discord.js'
import { env } from './utils/env';



export class Database {

  public static supabase: SupabaseClient = createClient(
    env('SUPABASE_DATABASE_URL'),
    env('SUPABASE_SERVICE_ROLE')
  );


  public static async getLogsChannelID(guildID: string): Promise<string> {

    const { data, error } = await this.supabase
      .from('guilds')
      .select('logs_channel')
      .eq('id', guildID)
    
    if (error) {
      throw error;
    }

    return data[0].logs_channel;

  }


  public static async setLogsChannel(guildID: string, channel: TextBasedChannel): Promise<void> {

    const { error } = await this.supabase
      .from('guilds')
      .update({ 'logs_channel': channel.id })
      .eq('id', guildID);
    
    if (error) {
      throw error;
    }

  }


  public static async registerGuild(guildID: string): Promise<void> {
    
    const { error } = await this.supabase
      .from('guilds')
      .insert({ id: guildID });
    
    if (error) {
      throw error;
    }

  }


  public static async getGuildData(guildID: string, columns?: string): Promise<Record<string, any> | undefined> {
    
    const { data, error } = await this.supabase
      .from('guilds')
      .select(columns)
      .eq('id', guildID)
    
    if (error) {
      throw error;
    }

    return data[0];

  }


  public static async getGuildsData(columns?: string): Promise<Record<string, any>[]> {
    
    const { data, error } = await this.supabase
      .from('guilds')
      .select(columns)
    
    if (error) {
      throw error;
    }

    return data;

  }


  public static async setChannelThreading(guildID: string, channelID: string, enable: boolean): Promise<void> {

    let data = await this.getGuildData(guildID, 'auto_threading_channels');

    // Is this guild not registered?
    if (!data) {

      await this.registerGuild(guildID);

      // Lets try again
      data = await this.getGuildData(guildID, 'auto_threading_channels');

      // Registered but still can't find it, this should never happen
      if (!data) {
        throw new Error(`Sorry, something broke, but it's not your fault!`);
      }

    }

    if (enable) {

      if (data.auto_threading_channels.includes(channelID)) {
        throw new Error('Threading already enabled here!');
      }
  
      data.auto_threading_channels.push(channelID);

    } else {

      const index = data.auto_threading_channels.findIndex(id => id === channelID);

      if (index === -1) {
        throw new Error('Threading is not enabled here!');
      }

      data.auto_threading_channels.splice(index, 1);

    }

    const { error } = await this.supabase
      .from('guilds')
      .update(data)
      .eq('id', guildID);
    
    if (error) {
      throw error;
    }

  }


  public static async getChannelsThreading(guildID: string): Promise<string[]> {

    const data = await this.getGuildData(guildID, 'auto_threading_channels');

    // Guild not registered?
    if (!data) {
      this.registerGuild(guildID).catch();
      return [];
    }

    return data.auto_threading_channels;

  }

}
