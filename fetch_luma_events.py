import requests
import re
import json
from datetime import datetime

def fetch_events():
    url = "https://luma.com/ns"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extract Next.js data
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', response.text)
        if not match:
            print("Could not find event data on the page.")
            return

        data = json.loads(match.group(1))
        
        # Navigate to events
        # Path based on analysis: props -> pageProps -> initialData -> data -> featured_items
        try:
            items = data['props']['pageProps']['initialData']['data']['featured_items']
        except KeyError:
            print("Data structure changed, could not find events list.")
            return

        print(f"Found {len(items)} events:\n")
        
        events_list = []
        
        for item in items:
            event = item.get('event', {})
            if not event:
                continue
                
            name = event.get('name', 'Untitled Event')
            start_str = event.get('start_at')
            
            # Format date
            date_display = "TBD"
            if start_str:
                dt = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                date_display = dt.strftime("%Y-%m-%d %H:%M")
            
            location = event.get('geo_address_info', {}).get('address', 'Unknown Location')
            if not location and event.get('location'):
                 location = event.get('location')

            event_id = event.get('api_id')
            link = f"https://luma.com/events/{event_id}" if event_id else "No Link"
            
            events_list.append(f"- **{name}**\n  - Date: {date_display}\n  - Location: {location}\n  - Link: {link}\n")

            events_list.append(f"- **{name}**\n  - Date: {date_display}\n  - Location: {location}\n  - Link: {link}\n")

        # Return formatted string
        return "\n".join(events_list)
        
    except Exception as e:
        return f"Error fetching events: {e}"

if __name__ == "__main__":
    print(fetch_events())
